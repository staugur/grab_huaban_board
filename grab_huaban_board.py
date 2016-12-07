#!/usr/bin/env python
# -*- coding: utf8 -*-

__version__ = "2.0"
__author__  = "Mr.tao"

import requests,re,sys,os,logging
from multiprocessing import cpu_count
from multiprocessing.dummy import Pool as ThreadPool 

logging.basicConfig(level=logging.DEBUG,
                format='[ %(levelname)s ] %(asctime)s %(filename)s:%(threadName)s:%(lineno)d %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S',
                filename='huaban.log',
                filemode='a')
headers     = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36", "Referer": 'https://www.saintic.com/'}
title_pat   = re.compile(r'<title>.*\((\d+).*\).*</title>')
pin_pat     = re.compile(r'("pin_id":)(\w*)')
pindata_pat = re.compile('"pin_id":(.*?),.+?"key":"(.*?)",.+?"type":"image/(.*?)"', re.S)

def GetPinImg(pin):
    url = "http://huaban.com/pins/%s/" %pin
    try:
        r = requests.get(url, timeout=15, verify=False, headers=headers)
    except Exception,e:
        logging.error(e, exc_info=True)
        return
    try:
        data  = re.findall(pindata_pat, r.text.encode('utf-8').split('\n')[-8].split('},')[0])[0]
        HtmlPin, QianNiuKey, ImgType = data
        logging.info((HtmlPin,QianNiuKey, len(QianNiuKey), ImgType))
    except Exception,e:
        logging.exception(e, exc_info=True)
    else:
        if HtmlPin == pin:
            ImgUrl = "http://img.hb.aicdn.com/%s_fw658" %QianNiuKey
            try:
                headers.update(Referer=url)
                req = requests.get(ImgUrl, timeout=10, verify=False, headers=headers)
            except Exception,e:
                logging.warn(e, exc_info=True)
            else:
                if not os.path.exists(str(board)):
                   os.mkdir(str(board))
                imageName = os.path.join(str(board), pin + "." + ImgType)
                with open(imageName, 'wb') as fp:
                    fp.write(req.content)
                print "Successful, board: %s, pin: %s, save as %s" %(board, pin, imageName)
        else:
            print "Board: %s, pin: %s, download error" %(board, pin)

def GetTitleImageNum():
    url  = "http://huaban.com/boards/%s/" %(board)
    data = requests.get(url, timeout=15, verify=False, headers=headers).text.encode('utf-8')
    return re.findall(title_pat, data)[0]

def GetBoard(processes):
    print "Current boards pins number is %s" %GetTitleImageNum()
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
        else:
            _pins= [ _[-1] for _ in re.findall(pin_pat, data) if _[-1] ]
            pins += _pins
            print "ajax get %s pins, last pin is %s, merged" %(len(_pins), pins[-1])
            if len(_pins) == 0:
                break
    print "Current pins for %s is %d" % (board, len(pins))
    pool = ThreadPool(processes=processes)
    data = pool.map(GetPinImg, pins)
    pool.close()
    pool.join()
    print "Download number:",len(data)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("-b", "--board", help="The board id for Huanban.com", type=int)
    parser.add_argument("-v", "--version", help="The version for grab_huaban_board project", action='store_true')
    parser.add_argument("-p", "--processes", help="Concurrent number", type=int)
    args       = parser.parse_args()
    board      = args.board
    version    = args.version
    processes  = args.processes or cpu_count()
    if version:
        print "From https://github.com/staugur/grab_huaban_board,", __version__
    if board:
        GetBoard(processes=processes)
