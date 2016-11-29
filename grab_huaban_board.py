#!/usr/bin/env python
# -*- coding: utf8 -*-

import requests,re,sys,os

def GetPinImg(board, pin):
    url = "http://huaban.com/pins/%s/" %pin
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36", "Referer": 'https://www.saintic.com/'}
    try:
        r = requests.get(url, timeout=15, verify=False, headers=headers)
    except Exception,e:
        print e
        return
    data1 = r.text.encode('utf-8')
    try:
        pat = re.compile('"pin_id":(.*?),.+?"key":"(.*?)",.+?"type":"image/(.*?)"', re.S)
        data2 = data1.split('\n')
        data3 = data2[-8].split('},')[0]
        data4 = re.findall(pat, data3)[0]
        HtmlPin, QianNiuKey, ImgType = data4
        #print data4,HtmlPin,QianNiuKey, len(QianNiuKey), ImgType
    except Exception,e:
        print e
    else:
        if HtmlPin == pin:
            ImgUrl = "http://img.hb.aicdn.com/%s_fw658" %QianNiuKey
            try:
                headers.update(Referer=url)
                req = requests.get(ImgUrl, timeout=10, verify=False, headers=headers)
            except Exception,e:
                print e
            else:
                if not os.path.exists(str(board)):
                   os.mkdir(str(board))
                imageName = os.path.join(str(board), pin + "." + ImgType)
                with open(imageName, 'wb') as fp:
                    fp.write(req.content)
                return "Board: %s, pin: %s, save as %s" %(board, pin, imageName)
        else:
            return "Board: %s, pin: %s, download error" %(board, pin)

def GetBoard(board):
    url = "http://huaban.com/boards/%s/" %(board)
    pat  = re.compile(r'("pin_id":)(\w*)')
    headers ={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36", "Referer": 'https://www.saintic.com/'}
    #get title pin number
    r = requests.get(url, timeout=15, verify=False, headers=headers)
    title_pat = re.compile(r'<title>.*\((\d+).*\).*</title>')
    data=r.text.encode('utf-8')
    allimages = re.findall(title_pat, data)[0]
    limit = 100
    print "Current boards pins number is %s" %allimages
    #get all pin data
    END = False
    #first
    url  = "http://huaban.com/boards/%s/?limit=%d" %(board, int(limit))
    data = requests.get(url, timeout=10, verify=False, headers=headers).text.encode('utf-8')
    pins = [ _[-1] for _ in re.findall(pat, data) if _[-1] ]
    while not END:
        #ajax
        url  = "http://huaban.com/boards/%s/?max=%s&limit=%s&wfl=1" %(board, pins[-1], limit)
        data = requests.get(url, timeout=10, verify=False, headers=headers).text.encode('utf-8')
        _pins= [ _[-1] for _ in re.findall(pat, data) if _[-1] ]
        print "ajax get %s pins, last pin is %s, merged" %(len(_pins), pins[-1])
        _pins= [ _[-1] for _ in re.findall(pat, data) if _[-1] ]
        pins += _pins
        if len(_pins) < limit:
            break
    print "Current pins is %d" %len(pins)
    num = 1
    for pin in pins:
        res = GetPinImg(board, pin)
        if res:
            print "successful, download %d, result is %s" %(num, res)
            num += 1
        else:
            print "miss one"
    else:
        return "no pins again, over, now download %s pin, all is %s"  %(len(pins), allimages)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("-b", "--board", help="The board id for Huanban.com", type=int)
    args = parser.parse_args()
    if args.board:
        print GetBoard(args.board)
