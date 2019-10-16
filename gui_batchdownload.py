#! /usr/bin/env python
#  -*- coding: utf-8 -*-
#
# 依赖： pip install pyinstaller pywin32
# 打包： pyinstaller.exe -F gui_batchdownload.py -i logo.ico -w --version-file version_file.txt
#       如需压缩，请到此https://github.com/upx/upx/releases下载对应的包（比如v3.95，win64）解压，打包时带上--upx .\upx-3.95-win64 
#

import os
from base64 import b64decode
import Tkinter as tk
from tkFileDialog import askdirectory
from threading import Timer, Thread
from tempfile import NamedTemporaryFile
import tkMessageBox
from sys import version_info

PY2 = version_info[0] == 2
if PY2:
    from urllib2 import build_opener
else:
    from urllib.request import build_opener

ListEqualSplit  = lambda l,n=100: [ l[i:i+n] for i in range(0,len(l), n) ]
logo_base64 = '''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'''
with NamedTemporaryFile(mode='w+b', prefix='grab-huaban-duitang-', suffix=".ico", delete=False) as fp:
    fp.write(b64decode(logo_base64))
    logo_file = fp.name

def _makedir(d):
    if not os.path.exists(d):
        os.makedirs(d)
    if os.path.exists(d):
        return True
    else:
        return False

def _get_url(url, site=None):
    """发起原生get请求"""
    class DO(dict):
        def __getattr__(self, name):
            try:
                return self[name]
            except KeyError:
                raise AttributeError(name)
    opener = build_opener()
    agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
    referer = 'https://huaban.com' if site == "huaban" else 'https://www.duitang.com'
    opener.addheaders = [('User-Agent', agent), ('Referer', referer)]
    response = opener.open(url)
    resp = dict(status=response.code, msg=response.msg, type=response.headers.type, maintype=response.headers.maintype, subtype=response.headers.subtype, headers=response.headers.dict, content=response.read())
    response.close()
    return DO(resp)

def _check_download_type(img_url):
    """根据img_url分析是花瓣网图片还是堆糖网图片，特征：
    #: 花瓣
    https://hbimg.b0.upaiyun.com/ec4433d815c45742a4ec1d5b6810c4ce9fe2f4d86e636-SoEBVh
    #: 堆糖
    https://b-ssl.duitang.com/uploads/item/201904/26/20190426115802_dUaAA.jpeg
    """
    if img_url:
        if img_url.startswith("https://hbimg.") or img_url.startswith("http://hbimg."):
            return "huaban"
        elif "duitang.com" in img_url:
            return "duitang"
    return "unknown"

class DownloadImage(Thread):

    def __init__(self, img_data, index=0, length=None):
        Thread.__init__(self)
        self.img_data = img_data
        self.index = index
        self.length = length - 1

    def run(self):
        """ 下载单个原图
        @param img_data dict: 图片所需数据，要求： {'img_url': xx, 'img_dir': xx}
        @param retry bool: 是否失败重试
        """
        imgurl = self.img_data["img_url"]
        site = _check_download_type(imgurl)
        name = imgurl.split("/")[-1]
        imgdir = os.path.join(self.img_data["img_dir"], site)
        support_showmessage(u"下载: NO.%s -> %s" %(self.index, name))
        try:
            if _makedir(imgdir) is True:
                response = _get_url(imgurl, site)
                if site in ("huaban", "unknown"):
                    imgname = os.path.join(imgdir, '%s.%s' %(name, response.subtype or "png"))
                else:
                    imgname = os.path.join(imgdir, name)
                if not os.path.isfile(imgname):
                    with open(imgname, 'wb') as fp:
                        fp.write(response.content)
        except:
            pass
        finally:
            if self.index == self.length:
                support_showmessage(u"下载完成", True)

#: 主窗口辅助模块
def support_showmessage(text, renew=False):
    """向message部分输出信息"""
    w.Label1.configure(text=text)
    if renew:
        #: 清空text
        w.Text1.delete('1.0', tk.END)
        #: 重新启用按钮
        w.Button1.configure(state="active")

def support_start_thread(data):
    for p in data:
        p.setDaemon(True)
        p.start()

def support_download_timer(text_list):
    if text_list and isinstance(text_list, list):
        tkMessageBox.showinfo(u"温馨提示", u"点击确定提交下载，期间请不要关闭主窗口，并关注窗口底部消息输出。")
        ms = 0
        seq = 20
        length = len(text_list)
        thread_ids = []
        for i,d in enumerate(text_list):
            p = DownloadImage(d, i, length)
            thread_ids.append(p)
        for data in ListEqualSplit(thread_ids, seq):
            root.update()
            root.after(ms, support_start_thread, data)
            ms += 2000

def support_batchDownload():
    """开始批量下载"""
    #: 禁用按钮
    w.Button1.configure(state="disabled")
    #: 获取要下载的url列表
    text = w.Text1.get(1.0, tk.END)
    text_list = [ i for i in text.split("\n") if i ]
    #: 下载存储的目录
    download_dir = w.Label2.cget("text") or os.getcwd()
    if text_list:
        #: 解析text，分出huaban、duitang和unknown站点
        huaban_list = [ i for i in text_list if _check_download_type(i) == "huaban" ]
        duitang_list = [ i for i in text_list if _check_download_type(i) == "duitang" ]
        unknown_list = [ i for i in text_list if _check_download_type(i) == "unknown" ]
        all_pins = []
        if os.path.isdir(os.path.join(download_dir, "huaban")):
            all_pins +=  [ i.split('.')[0] for i in os.listdir(os.path.join(download_dir, "huaban")) ]
        if os.path.isdir(os.path.join(download_dir, "duitang")):
            all_pins += [ i for i in os.listdir(os.path.join(download_dir, "duitang")) ]
        if os.path.isdir(os.path.join(download_dir, "unknown")):
            all_pins += [ i for i in os.listdir(os.path.join(download_dir, "unknown")) ]
        data = [ {"img_url":i, "img_dir": download_dir} for i in text_list if i.split("/")[-1] not in all_pins ]
        if data:
            support_showmessage(u"本次批量下载概述：花瓣网 %s 条，堆糖网 %s 条，未知 %s 条，有效 %s 条！" %(len(huaban_list), len(duitang_list), len(unknown_list), len(data)))
            root.update()
            root.after(1000, support_download_timer, data)
        else:
            support_showmessage(u"您输入的已经全部下载完成", True)
    else:
        support_showmessage(u"请输入花瓣网下载或堆糖网下载中复制的文本！")
        w.Button1.configure(state="active")

def support_init(top, gui, *args, **kwargs):
    global w, top_level, root, timer
    w = gui
    top_level = top
    root = top

def support_destroy_window():
    # Function which closes the window.
    global top_level
    top_level.destroy()
    top_level.update
    top_level = None
    os.remove(logo_file)

#: 启动主窗口
def vp_start_gui():
    '''Starting point when module is the main routine.'''
    global w, root
    root = tk.Tk()
    top = Toplevel1 (root)
    support_init(root, top)
    root.protocol("WM_DELETE_WINDOW", support_destroy_window)
    root.mainloop()

#: 主窗口类
class Toplevel1:

    def __init__(self, top=None):
        '''This class configures and populates the toplevel window.
           top is the toplevel containing window.'''
        _bgcolor = '#d9d9d9'  # X11 color: 'gray85'
        _fgcolor = '#000000'  # X11 color: 'black'
        _compcolor = '#d9d9d9' # X11 color: 'gray85'
        _ana1color = '#d9d9d9' # X11 color: 'gray85'
        _ana2color = '#ececec' # Closest X11 color: 'gray92'

        top.geometry("600x450+590+251")
        top.title(u"花瓣网、堆糖网脚本--文本下载工具")
        top.iconbitmap(logo_file)
        top.configure(background="#d9d9d9")

        self.Button1 = tk.Button(top)
        self.Button1.place(relx=0.033, rely=0.022, height=28, width=137)
        self.Button1.configure(activebackground="#ececec")
        self.Button1.configure(activeforeground="#000000")
        self.Button1.configure(background="#d9d9d9")
        self.Button1.configure(command=support_batchDownload)
        self.Button1.configure(disabledforeground="#a3a3a3")
        self.Button1.configure(foreground="#000000")
        self.Button1.configure(highlightbackground="#d9d9d9")
        self.Button1.configure(highlightcolor="black")
        self.Button1.configure(pady="0")
        self.Button1.configure(text=u'开始批量下载')

        #选择路径
        self.Button2 = tk.Button(top)
        self.Button2.place(relx=0.3, rely=0.022, height=28, width=60)
        self.Button2.configure(activebackground="#ececec")
        self.Button2.configure(activeforeground="#000000")
        self.Button2.configure(background="#d9d9d9")
        self.Button2.configure(disabledforeground="#a3a3a3")
        self.Button2.configure(foreground="#000000")
        self.Button2.configure(highlightbackground="#d9d9d9")
        self.Button2.configure(highlightcolor="black")
        self.Button2.configure(pady="0")
        self.Button2.configure(text=u'选择目录')
        self.Button2.configure(command=self.selectPath)

        #显示选择后的路径
        self.Label2 = tk.Label(top)
        self.Label2.place(relx=0.4, rely=0.022, height=28)
        self.Label2.configure(background="#d9d9d9")
        self.Label2.configure(disabledforeground="#a3a3a3")
        self.Label2.configure(foreground="#000000")
        self.Label2.configure(text=u'')

        self.Text1 = tk.Text(top)
        self.Text1.place(relx=0.033, rely=0.089, relheight=0.827, relwidth=0.94)
        self.Text1.configure(background="white")
        self.Text1.configure(borderwidth="0")
        self.Text1.configure(font="TkTextFont")
        self.Text1.configure(foreground="black")
        self.Text1.configure(highlightbackground="#d9d9d9")
        self.Text1.configure(highlightcolor="black")
        self.Text1.configure(insertbackground="black")
        self.Text1.configure(selectbackground="#c4c4c4")
        self.Text1.configure(selectforeground="black")
        self.Text1.configure(width=564)
        self.Text1.configure(wrap="word")

        self.Label1 = tk.Label(top)
        self.Label1.place(relx=0.033, rely=0.933, height=23, width=500)
        self.Label1.configure(background="#d9d9d9")
        self.Label1.configure(disabledforeground="#a3a3a3")
        self.Label1.configure(foreground="#000000")
        self.Label1.configure(text=u'')

    def selectPath(self):
        path_ = askdirectory(title=u"请选择或新建一个目录以存储将要下载的图片")
        if path_:
            self.Label2.configure(text=path_)

    @staticmethod
    def popup1(event, *args, **kwargs):
        Popupmenu1 = tk.Menu(root, tearoff=0)
        Popupmenu1.configure(activebackground="#f9f9f9")
        Popupmenu1.configure(activeborderwidth="1")
        Popupmenu1.configure(activeforeground="black")
        Popupmenu1.configure(background="#d9d9d9")
        Popupmenu1.configure(borderwidth="1")
        Popupmenu1.configure(disabledforeground="#a3a3a3")
        Popupmenu1.configure(font="{Microsoft YaHei UI} 9")
        Popupmenu1.configure(foreground="black")
        Popupmenu1.post(event.x_root, event.y_root)

    @staticmethod
    def popup2(event, *args, **kwargs):
        Popupmenu2 = tk.Menu(root, tearoff=0)
        Popupmenu2.configure(activebackground="#f9f9f9")
        Popupmenu2.configure(activeborderwidth="1")
        Popupmenu2.configure(activeforeground="black")
        Popupmenu2.configure(background="#d9d9d9")
        Popupmenu2.configure(borderwidth="1")
        Popupmenu2.configure(disabledforeground="#a3a3a3")
        Popupmenu2.configure(font="{Microsoft YaHei UI} 9")
        Popupmenu2.configure(foreground="black")
        Popupmenu2.post(event.x_root, event.y_root)

if __name__ == '__main__':
    vp_start_gui()
