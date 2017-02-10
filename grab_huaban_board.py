#!/usr/bin/env python
# -*- coding: utf8 -*-

__version__ = "4.0"
__author__  = "Mr.tao"
__doc__     = "http://www.saintic.com/blog/204.html"

import requests, re, os, logging, json
from multiprocessing import cpu_count, Process
from multiprocessing.dummy import Pool as ThreadPool

logging.basicConfig(level=logging.DEBUG,
                format='[ %(levelname)s ] %(asctime)s %(filename)s:%(threadName)s:%(process)d:%(lineno)d %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S',
                filename='huaban.log',
                filemode='a')
headers        = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36", "Referer": 'https://www.saintic.com/'}
title_pat      = re.compile(r'<title>.*\((\d+).*\).*</title>')
pin_pat        = re.compile(r'("pin_id":)(\w*)')
pindata_pat    = re.compile('"pin_id":(.*?),.+?"key":"(.*?)",.+?"type":"image/(.*?)"', re.S)


def print_green(msg):
    print '\033[92m{}\033[0m'.format(str(msg))

def print_blue(msg):
    print '\033[94m{}\033[0m'.format(str(msg))

def print_yellow(msg):
    print '\033[93m{}\033[0m'.format(str(msg))

def print_header(msg):
    print '\033[95m{}\033[0m'.format(str(msg))

def Mkdir(d):
    d = str(d)
    if not os.path.exists(d):
        os.makedirs(d)
    if os.path.exists(d):
        return True
    else:
        return False

def BoardGetTitleImageNum(board):
    """ 查询画板的pin数量 """
    logging.debug("{}, start to get the title number".format(board))
    url  = "http://huaban.com/boards/%s/" %(board)
    data = requests.get(url, timeout=10, verify=False, headers=headers).text.encode('utf-8')
    title= re.findall(title_pat, data)[0]
    logging.info(title)
    return title

def BoardGetPins(board):
    """ 获取画板下所有pin """
    logging.debug("{}, start to get the pins data".format(board))
    #get first pin data
    url  = "http://huaban.com/boards/%s/?limit=100" % board
    data = requests.get(url, timeout=10, verify=False, headers=headers).text.encode('utf-8')
    pins = [ _[-1] for _ in re.findall(pin_pat, data) if _[-1] ]
    while 1:
        #get ajax pin data
        url = "http://huaban.com/boards/%s/?max=%s&limit=100&wfl=1" %(board, pins[-1])
        try:
            data = requests.get(url, timeout=10, verify=False, headers=headers).text.encode('utf-8')
        except requests.exceptions.ReadTimeout,e:
            logging.exception(e, exc_info=True)
            continue
        else:
            _pins = [ _[-1] for _ in re.findall(pin_pat, data) if _[-1] ]
            pins += _pins
            print_blue("ajax get {} pins, last pin is {}, merged".format(len(_pins), pins[-1]))
            if len(_pins) == 0:
                break
    return pins

def DownloadPinImg(pin):
    """ 下载单个pin图片 """
    logging.debug("{}, start to download itself".format(pin))
    url = "http://huaban.com/pins/%s/" %pin
    try:
        r = requests.get(url, timeout=15, verify=False, headers=headers)
        data  = re.findall(pindata_pat, r.text.encode('utf-8').split('\n')[-8].split('},')[0])[0]
        HtmlPin, QianNiuKey, ImgType = data
        logging.info((HtmlPin,QianNiuKey, len(QianNiuKey), ImgType))
    except Exception,e:
        logging.error(e, exc_info=True)
    else:
        if HtmlPin == pin:
            ImgUrl = "http://img.hb.aicdn.com/%s_fw658" %QianNiuKey
            try:
                headers.update(Referer=url)
                req = requests.get(ImgUrl, timeout=10, verify=False, headers=headers)
            except Exception,e:
                logging.warn(e, exc_info=True)
            else:
                imageName = "{}.{}".format(pin, ImgType)
                with open(imageName, 'wb') as fp:
                    fp.write(req.content)
                print "Successful, pin: {}, save as {}".format(pin, imageName)
                return True
        else:
            print "Failed download, pin: {}".format(pin)
    return False

def ExecuteDownloadPins(pins, processes):
    """ 并发processes个线程下载所有pins """
    pool = ThreadPool(processes=processes)
    data = pool.map(DownloadPinImg, pins)
    pool.close()
    pool.join()
    return data

def GetUserBoards(user, limit=10):
    """ 查询user的画板, 默认limit=10, 表示最多下载10个画板, 虽然可能会下载不全, 但是此值不宜过大, 每个画板下载会开启一个进程, 过大会使系统崩溃 """

    try:
        r = requests.get("http://huaban.com/{}/?limit={}".format(user, limit))
    except Exception,e:
        logging.error(e, exc_info=True)
    else:
        if r.status_code == 200:
            try:
                data =json.loads(r.text.split('app.page["user"] = ')[-1].split("app.route();")[0].split("app._csr")[0].strip(";\n"))
            except Exception,e:
                logging.error(e, exc_info=True)
            else:
                boards = [ _.get("board_id") for _ in data.get("boards") ]
                logging.info("query user boards is {}".format(boards))
                return boards
        else:
            return print_yellow("No such user {}".format(user))

def ExecuteDownloadBoard(board, processes):
    """ 执行下载：抓取花瓣网某画板图片 """
    logging.debug("{}, start to download the board with processes={}".format(board, processes))

    _base_dir = os.path.dirname(os.path.abspath(__file__))
    if isinstance(board, int) and isinstance(processes, int):
        if Mkdir(board):
            os.chdir(str(board))
            print_header("Current board <{}> pins number that title is {}".format(board, BoardGetTitleImageNum(board)))
            pins = BoardGetPins(board)
            print_blue("Current board {} pins number that requests is {}, will ExecuteDownloadPins".format(board, len(pins)))
            resp = ExecuteDownloadPins(pins, processes)
            print_green("Current board {} download number is {}".format(board, len([ _ for _ in resp if _ == True ])))
        else:
            print_yellow("mkdir failed for {}".format(board))
    else:
        print "Params Error"
    os.chdir(_base_dir)

def ExecuteDownloadUser(user, processes):
    """ 执行下载：抓取花瓣网某用户所有画板 """
    logging.debug("{}, start to download the user board with processes={}".format(user, processes))

    boards = GetUserBoards(user)
    _base_dir = os.path.dirname(os.path.abspath(__file__))
    logging.info("query user boards, the number is {}, data is {}".format(len(boards), boards))
    if boards:
        if Mkdir(user):
            os.chdir(user)
            worker = []
            for board in boards:
                p = Process(target=ExecuteDownloadBoard, args=(int(board), int(processes)), name="grab.user.board.{}.huaban".format(board))
                #p.daemon=True
                worker.append(p)
            for p in worker: p.start()
            for p in worker: p.join()
        else:
            return "mkdir failed for user {}".format(user)
    else:
        return "No boards data"
    os.chdir(_base_dir)

def main(users=None, boards=None, processes=6):
    """ 引导函数 """
    if users:
        Mkdir("users")
        os.chdir("users")
        worker = []
        for user in users:
            p = Process(target=ExecuteDownloadUser, args=(user, int(processes)), name="grab.user.{}.huaban".format(user))
            #p.daemon=True
            worker.append(p)
        for p in worker: p.start()
        for p in worker: p.join()
    elif boards:
        Mkdir("boards")
        os.chdir("boards")
        worker = []
        for board in boards:
            p = Process(target=ExecuteDownloadBoard, args=(int(board), int(processes)), name="grab.board.{}.huaban".format(board))
            #p.daemon=True
            worker.append(p)
        for p in worker: p.start()
        for p in worker: p.join()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("-b", "--board", help="The board id for Huanban.com")
    parser.add_argument("-v", "--version", help="The version for grab_huaban_board project", action='store_true')
    parser.add_argument("-p", "--processes", help="Concurrent number", type=int)
    parser.add_argument("-u", "--user", help="The user for Huanban.com")
    args       = parser.parse_args()
    user       = args.user
    board      = args.board
    version    = args.version
    processes  = args.processes or cpu_count()

    if version:
        print "From https://github.com/staugur/grab_huaban_board,", __version__
    elif user:
        users = user.split(",")
        main(users=users, processes=processes)
    elif board:
        boards = board.split(",")
        main(boards=boards, processes=processes)
    else:
        parser.print_help()
