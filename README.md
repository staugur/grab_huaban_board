# grab_huaban_board
花瓣网多用户多画板爬虫


## 解析

* 查看analyze.txt


## 使用

```
git clone https://github.com/staugur/grab_huaban_board
cd grab_huaban_board
```

### for Python

1. pip install requests

2. python grab_huaban_board.py

```
usage: grab_huaban_board.py [-h] [-a ACTION] [-u USER] [-p PASSWORD] [-v]
                            [--board_id BOARD_ID] [--user_id USER_ID]

optional arguments:
  -h, --help            show this help message and exit
  -a ACTION, --action ACTION
                        脚本动作 -> 1. getBoard: 抓取单画板(默认);
                        2. getUser: 抓取单用户
  -u USER, --user USER  花瓣网账号-手机/邮箱
  -p PASSWORD, --password PASSWORD
                        花瓣网账号对应密码
  -v, --version         查看版本号
  --board_id BOARD_ID   花瓣网单个画板id, action=getBoard时使用
  --user_id USER_ID     花瓣网单个用户id, action=getUser时使用
```

* 详细使用文档请参考: [https://www.saintic.com/blog/204.html](https://www.saintic.com/blog/204.html "https://www.saintic.com/blog/204.html")


### for JavaScript

* 详细使用文档请参考：[https://www.saintic.com/blog/256.html](https://www.saintic.com/blog/256.html "https://www.saintic.com/blog/256.html")


## TODO
1. --board_ids 多画板
2. --user_ids 多用户
3. --igonre 指定忽略画板
