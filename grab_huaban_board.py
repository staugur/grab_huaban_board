#!/usr/bin/env python
# -*- coding: utf8 -*-

__version__ = "3.0"
__author__  = "Mr.tao"
__doc__     = "http://www.saintic.com/blog/204.html"

import requests, re, os, logging
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
BOARDS_BASEDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "boards")
if not os.path.exists(BOARDS_BASEDIR):os.mkdir(BOARDS_BASEDIR)

def print_green(msg):
    print '\033[92m{}\033[0m'.format(str(msg))

def print_blue(msg):
    print '\033[94m{}\033[0m'.format(str(msg))

def print_yellow(msg):
    print '\033[93m{}\033[0m'.format(str(msg))

def print_header(msg):
    print '\033[95m{}\033[0m'.format(str(msg))

def MkdirBoard(board):
    """ 创建名为board的画板目录 """
    logging.debug("{}, start to mkdir a directory".format(board))
    DIR = os.path.join(BOARDS_BASEDIR, str(board))
    if not os.path.exists(DIR):
        os.mkdir(DIR)
    if os.path.exists(DIR):
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
        return False
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
        else:
            print "Failed download, pin: {}".format(pin)

def ExecuteDownloadPins(pins, processes):
    """ 并发processes个线程下载所有pins """
    pool = ThreadPool(processes=processes)
    data = pool.map(DownloadPinImg, pins)
    pool.close()
    pool.join()
    return data

def ExecuteDownloadBoard(board, processes):
    """ 执行下载：抓取花瓣网某画板 """
    logging.debug("{}, start to download the board with processes={}".format(board, processes))
    if isinstance(board, int) and isinstance(processes, int):
        os.chdir(BOARDS_BASEDIR)
        if MkdirBoard(board):
            os.chdir(os.path.join(BOARDS_BASEDIR, str(board)))
            print_header("Current board <{}> pins number that title is {}".format(board, BoardGetTitleImageNum(board)))
            pins = BoardGetPins(board)
            print_blue("Current board {} pins number that requests is {}, will ExecuteDownloadPins".format(board, len(pins)))
            resp = ExecuteDownloadPins(pins, processes)
            print_green("Current board {} download number is {}".format(board, len(resp)))
        else:
            print_yellow("mkdir {} failed".format(board))
    else:
        print "Params Error"

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("-b", "--board", help="The board id for Huanban.com")
    parser.add_argument("-v", "--version", help="The version for grab_huaban_board project", action='store_true')
    parser.add_argument("-p", "--processes", help="Concurrent number", type=int)
    args       = parser.parse_args()
    board      = args.board
    version    = args.version
    processes  = args.processes or cpu_count()
    if version:
        print "From https://github.com/staugur/grab_huaban_board,", __version__
    elif board:
        boards = board.split(",")
        worker = []
        for board in boards:
            p = Process(target=ExecuteDownloadBoard, args=(int(board), int(processes)), name="grab.{}.huaban".format(board))
            p.daemon=True
            worker.append(p)
        for p in worker:
            p.start()
        for p in worker:
            p.join()
    else:
        parser.print_help()
