#!/usr/bin/env python
# -*- coding: utf8 -*-

__version__ = "0.1.0"
__author__ = "staugur"
__doc__ = "将图片上传到picbed"

import shelve
import requests
from time import time
from os import listdir, sep
from os.path import isdir, join, abspath, dirname, isfile
from sys import version_info
from grab_huaban_board import request, printcolor, BASE_URL

BASE_DIR = dirname(abspath(__file__))
PICBED_URL = None
PICBED_TOKEN = None
STORAGE_INDEX = ".up2picbed.dat"
ALLOWED_SUFFIX = ("png", "jpg", "jpeg", "gif", "webp")

PY2 = version_info[0] == 2

if PY2:  # pragma: nocover

    def iteritems(d):
        return d.iteritems()

    text_type = unicode
    string_types = (str, unicode)

else:  # pragma: nocover

    def iteritems(d):
        return iter(d.items())

    text_type = str
    string_types = (str,)


class LocalStorage(object):
    """Local file system storage based on the shelve module."""

    def __init__(self):
        self.index = join(BASE_DIR, STORAGE_INDEX)

    def _open(self, flag="c"):
        return shelve.open(
            filename=abspath(self.index),
            flag=flag,
            protocol=2,
            writeback=False
        )

    @property
    def list(self):
        """list all data

        :returns: dict
        """
        db = None
        try:
            db = self._open("r")
        except:
            return {}
        else:
            return dict(db)
        finally:
            if db:
                db.close()

    def __ck(self, key):
        if PY2 and isinstance(key, text_type):
            key = key.encode("utf-8")
        if not PY2 and not isinstance(key, text_type):
            key = key.decode("utf-8")
        return key

    def set(self, key, value):
        """Set persistent data with shelve.

        :param key: str: Index key

        :param value: All supported data types in python
        """
        db = self._open()
        try:
            db[self.__ck(key)] = value
        finally:
            db.close()

    def setmany(self, **mapping):
        if mapping and isinstance(mapping, dict):
            db = self._open()
            for k, v in iteritems(mapping):
                db[self.__ck(k)] = v
            db.close()

    def get(self, key, default=None):
        """Get persistent data from shelve.

        :returns: data
        """
        try:
            value = self.list[key]
        except KeyError:
            return default
        else:
            return value

    def remove(self, key):
        db = self._open()
        del db[key]

    def __len__(self):
        return len(self.list)

    def __str__(self):
        return "<%s object at %s, index is %s>" % (
            self.__class__.__name__, hex(id(self)), self.index
        )

    __repr__ = __str__


def board2piced(album, board_path):
    if isdir(board_path):
        apiurl = "%s/api/upload" % PICBED_URL.rstrip("/")
        headers = {
            "User-Agent": "grab_huaban_board/%s" % __version__,
            "Authorization": "Token %s" % PICBED_TOKEN
        }
        storage = LocalStorage()
        success = []
        for filename in listdir(board_path):
            suffix = filename.split(".")[-1]
            filepath = join(board_path, filename)
            sindex = filepath.split(BASE_DIR)[-1]
            if storage.get(sindex):
                printcolor("%s 已上传，继续下一个" % filepath, "blue")
                continue
            if isfile(filepath) and suffix in ALLOWED_SUFFIX:
                files = {
                    'picbed': (
                        filename, open(filepath, 'rb'), 'image/%s' % suffix
                    )
                }
                try:
                    r = requests.post(
                        apiurl,
                        files=files,
                        headers=headers,
                        data=dict(album=album),
                        timeout=30
                    )
                except requests.exceptions.RequestException as e:
                    printcolor(
                        u"%s 上传错误：%s" % (filepath, e.message),
                        "yellow"
                    )
                else:
                    result = r.json()
                    if result.get("code") == 0:
                        success.append(sindex)
                        printcolor(u"%s 上传成功" % filepath, "green")
                    else:
                        printcolor(
                            u"%s 上传失败：%s" % (filepath, result["msg"]),
                            "yellow"
                        )
        if success:
            storage.setmany(**{f: time() for f in success})


def main(parser):
    global PICBED_URL, PICBED_TOKEN
    args = parser.parse_args()
    is_board = args.board
    is_user = args.user
    if not is_board and not is_user:
        parser.print_help()
        return
    bou = args.board_or_user
    PICBED_URL = args.picbed_url
    PICBED_TOKEN = args.picbed_token
    if not PICBED_URL:
        printcolor("请输入picbed地址")
        return
    if is_user:
        if isdir(join(BASE_DIR, bou)):
            boards = [
                join(BASE_DIR, bou, d)
                for d in listdir(bou)
                if isdir(join(BASE_DIR, bou, d))
            ]
        else:
            printcolor("用户目录不存在", "red")
    else:
        boards = [
            join(BASE_DIR, "boards", d)
            for d in bou.split(",")
            if isdir(join(BASE_DIR, "boards", d))
        ]
    for board_path in boards:
        board_id = board_path.split(sep)[-1]
        album = board_id
        try:
            board_info = request.get(
                "%s/boards/%s" % (BASE_URL, board_id),
                timeout=5
            ).json()
        except requests.exceptions.RequestException:
            pass
        else:
            if isinstance(board_info, dict) and "board" in board_info:
                board_info = board_info["board"]
                album = board_info.get("title") or board_info["board_id"]
        board2piced(album, board_path)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("-b", "--board",  action='store_true', default=True,
                        help=u"上传画板，允许逗号选择多个，默认此项")
    parser.add_argument("-u", "--user", help=u"上传单个用户下所有画板",
                        action='store_true')
    parser.add_argument("--picbed-url", help=u"picbed的根域名")
    parser.add_argument("--picbed-token", help=u"picbed的用户token")
    parser.add_argument("board_or_user", type=str, help=u"画板ID或用户名")
    main(parser)
