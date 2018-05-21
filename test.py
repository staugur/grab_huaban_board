#!/usr/bin/env python
# -*- coding: utf8 -*-

__version__ = "5.0"
__author__  = "Mr.tao"
__doc__     = "http://www.saintic.com/blog/204.html"

import requests, re, os, logging, json

logging.basicConfig(level=logging.INFO,
                format='[ %(levelname)s ] %(asctime)s %(filename)s:%(threadName)s:%(process)d:%(lineno)d %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S',
                filename='huaban.log',
                filemode='a')
headers = {'X-Request': 'JSON', 'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://huaban.com', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36', 'Accept':'application/json'}
cookies = {'__auc': '5c92e06816382f2863d83418ac5', '_cnzz_CV1256903590': 'is-logon%7Clogged-out%7C1526910323204', '_ga': 'GA1.2.1856651272.1526910322', '__asc': '5c92e06816382f2863d83418ac5', '_uab_collina': '152691032203679580118984', 'sid': 'f5nNZXSX9rLn8NTCiWZrqSGQ7jK.5dHZKijSwjNmBYC0jKEiDDTQ7dUcBUA08%2BUbdhA5%2Fj8', '_f': 'iVBORw0KGgoAAAANSUhEUgAAADIAAAAUCAYAAADPym6aAAABJElEQVRYR%2B1VOxYCIQwMF7KzsvFGXmW9kY2VnQfxCvgCRmfzCD9lnz53myWQAJOZBEfeeyIi7xz%2FyEXzZRPFhYbPc3hHXO6I6TbFixmfEyByeQQSxu6BcAXSkIGMazMjuBcz8pQcq44o0Iuyyc1p38C62kNsOdeSZDOQlLRQ80uOMalDgWCGMfsW2B5%2FATMUyGh2uhgptV9Ly6l5nNOa1%2F6zmjTqkH2aGEk2jY72%2B5k%2BNd9lBfLMh8GIP11iK95vw8uv7RQr4oNxOfbQ%2F7g5Z4meveyt0uKDEIiMLRC4jrG1%2FjkwKxCRE2e5lF30leyXYvQ628MZKV3q64HUFvnPAMkVuSWlEouLSiuV6dp2WtPBrPZ7uO5I18tbXWvEC27t%2BTcv%2Bx0JuJAoUm2L%2FQAAAABJRU5ErkJggg%3D%3D%2CWin32.1536.864.24', 'UM_distinctid': '16382f2861854d-0afc08f752cd6d-737356c-144000-16382f2861972b', 'CNZZDATA1256903590': '1742071242-1526906615-%7C1526906615'}

def printcolor(msg, color=None):
    if color == "green":
        print '\033[92m{}\033[0m'.format(str(msg))
    elif color == "blue":
        print '\033[94m{}\033[0m'.format(str(msg))
    elif color == "yellow":
        print '\033[93m{}\033[0m'.format(str(msg))
    elif color == "red":
        print '\033[95m{}\033[0m'.format(str(msg))
    else:
        print str(msg)

def Mkdir(d):
    d = str(d)
    if not os.path.exists(d):
        os.makedirs(d)
    if os.path.exists(d):
        return True
    else:
        return False

def BoardGetPins(board_id):
    """ 获取画板下所有pin """
    board_url = 'https://huaban.com/boards/{}/'.format(board_id)
    try:
        #get first pin data
        board_data = requests.get(board_url, headers=headers).json()["board"]
    except Exception,e:
        logging.error(e, exc_info=True)
    else:
        board_number = board_data["pin_count"]
        board_pins = board_data["pins"]
        while 1:
            #get ajax pin data
            board_next_url = "https://huaban.com/boards/%s/?max=%s&limit=100&wfl=1" %(board_id, board_pins[-1])
            try:
                board_next_data = requests.get(board_next_url, headers=headers).json()["board"]
            except Exception,e:
                logging.error(e, exc_info=True)
                continue
            else:
                board_pins += board_next_data["pins"]
                printcolor("ajax get {} pins, last pin is {}, merged".format(len(board_next_data["pins"]), board_next_data["pins"][-1]["pin_id"]), "blue")
                if len(board_next_data["pins"]) == 0:
                    break
        return board_pins

def DownloadPinImg(pin):
    """ 下载单个pin图片 """
    logging.debug("{}, start to download itself".format(pin))
    url = "http://huaban.com/pins/%s/" %pin
    try:
        r = requests.get(url, timeout=15, verify=False, headers=headers)
        data  = re.findall(pindata_pat, r.text.encode('utf-8').split('\n')[-9].split('},')[0])[0]
        HtmlPin, QianNiuKey, ImgType = data
        # 有部分返回头返回的格式不标准，例如有 "jpeg,image/gif" ( -b 30628524 )，无法根据返回头创建文件，因此需要过滤
        # by mingcheng 2017-02-27
        if len(ImgType.split(",")) > 1:
            ImgType = ImgType.split(",")[0]
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

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("-b", "--board", help="The board id for Huanban.com")
    parser.add_argument("-v", "--version", help="The version for grab_huaban_board project", action='store_true')
    args       = parser.parse_args()
    board      = args.board
    version    = args.version
    if version:
        print "From https://github.com/staugur/grab_huaban_board,", __version__
    elif board:
        print BoardGetPins(board)
    else:
        parser.print_help()
