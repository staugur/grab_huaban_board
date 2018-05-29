// ==UserScript==
// @name         花瓣网下载
// @namespace    https://www.saintic.com/
// @version      0.1
// @description  花瓣网(huaban.com)用户画板图片批量下载到本地
// @author       staugur
// @match        http*://huaban.com/boards/*
// @match        http*://huaban.com/*
// @exclude      http*://huaban.com/boards/*/edit/*
// @exclude      http*://huaban.com/boards/*/followers/*
// @exclude      http*://huaban.com/*/likes/*
// @exclude      http*://huaban.com/*/tags/*
// @exclude      http*://huaban.com/*/following/*
// @require      https://cdn.bootcss.com/FileSaver.js/2014-11-29/FileSaver.min.js
// @grant        GM_setClipboard
// @license      MIT
// @date         2018-05-25
// @modified     none
// @github       https://github.com/staugur/grab_huaban_board
// @supportURL   https://github.com/staugur/grab_huaban_board/issues
// ==/UserScript==

(function() {
    'use strict';
    /*
        公共接口
    */
    //字符串是否包含子串
    function isContains(str, substr) {
        //str是否包含substr
        return str.indexOf(substr) >= 0;
    }
    //数组是否包含某元素
    function arrayContains(arr, obj) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === obj) {
                return true;
            }
        }
        return false;
    }
    //判断页面中id是否存在
    function hasId(id) {
        //有此id返回true，否则返回false
        var element = document.getElementById(id);
        if (element) {
            return true
        } else {
            return false
        }
    }
    //保存图片
    function saveImage(imgUrl, imgName) {
        //imgUrl: 图片地址; imgName: 保存的文件名
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', imgUrl, true);
            xhr.responseType = 'blob';
            xhr.onload = () => {
                if (xhr.status === 200) {
                    //将图片文件用浏览器中下载
                    saveAs(xhr.response, imgName);
                }
            };
            xhr.send();
        } catch (e) {
            console.log(e);
        }
    }
    //加载css文件
    function addCSS(href) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = href;
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    //加载js文件
    function addJS(src, cb) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = src;
        document.getElementsByTagName('head')[0].appendChild(script);
        script.onload = typeof cb === "function" ? cb : function() {};
    }
    //由于@require方式引入jquery时layer使用异常，故引用cdn中jquery v1.10.1；加载完成后引用又拍云中layer v3.1.1
    addJS("https://cdn.bootcss.com/jquery/1.10.1/jquery.min.js", function() {
        addJS("https://cdn.bootcss.com/layer/3.1.0/layer.js");
    });
    /*
        下载用户画板接口
    */
    //交互确定下载方式
    function interactive(board_id, pins) {
        var msg = [
            '<b>当前画板共抓取' + pins.length + '张图片！</b><small>提示: 只有登录后才可以抓取几乎所有图片哦。</small><br/>',
            '<b>请选择以下三种下载方式：</b><br/>',
            '1. <i>文本</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片地址按行显示，提供复制，粘贴至迅雷、QQ旋风等下载工具批量下载即可，推荐使用此方法。<br/>',
            '2. <i>本地</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片直接保存到硬盘中，由于是批量下载，所以浏览器设置中请关闭"下载前询问每个文件的保存位置"，并且允许浏览器下载多个文件的授权申请，以保证可以自动批量保存，否则每次保存时会弹出询问，对您造成困扰。<br/>',
            '3. <i>远程</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片将由第三方服务器下载并压缩，提供压缩文件链接，直接下载此链接解压即可。<br/>',
            '<br/><p><b>寻求帮助？</b><a href="https://www.saintic.com/blog/256.html" target="_blank" title="帮助文档" style="color: green;">请点击我！</a></p>'
        ].join('');
        layer.confirm(msg, {
            title: "选择画板图片下载方式",
            closeBtn: false,
            shadeClose: false,
            shade: 0,
            btn: ['文本', '本地', '远程'],
            btnAlign: 'c',
            btn3: function(index) {
                //远端下载
                $.ajax({
                    url: "https://www.saintic.com/CrawlHuaban/",
                    type: "POST",
                    data: {
                        board_id: board_id,
                        pins: JSON.stringify(pins)
                    },
                    success: function(res) {
                        if (res.success === true) {
                            var msg = "<b>下载任务已经提交！</b><br>根据画板图片数量，所需时间不等，请稍等数分钟后访问下载链接：<br><i><a href='" + res.downloadUrl + "' target='_blank'>" + res.downloadUrl + "</a></i><br>它将于" + res.expireTime + "过期，资源会被删除，请在那之前下载。";
                            layer.alert(msg, {
                                icon: 1,
                                title: "温馨提示",
                                btn: '我已知晓并复制下载链接',
                                btnAlign: 'c'
                            }, function(index) {
                                layer.close(index);
                                GM_setClipboard(res.downloadUrl);
                                layer.msg("复制成功", {
                                    icon: 1
                                });
                            });
                        } else {
                            layer.msg("第三方服务异常: " + res.msg);
                        }
                    }
                });
            }
        }, function(index) {
            //文本方式下载，比如迅雷、QQ旋风
            layer.alert('<b>请点击复制按钮，粘贴到迅雷等下载！</b><br/>', {
                title: "文本方式下载",
                btn: '复制',
                btnAlign: 'c',
                icon: 1,
                yes: function(index, layero) {
                    var str = '';
                    for (var i = 0, len = pins.length; i < len; i++) {
                        str += pins[i].imgUrl + "\n";
                    }
                    GM_setClipboard(str);
                    layer.msg("复制成功", {
                        icon: 1
                    });
                }
            });
        }, function(index) {
            //本地下载
            for (var i = 0, len = pins.length; i < len; i++) {
                saveImage(pins[i].imgUrl, pins[i].imgName);
            }
        });
    }
    //画板解析与下载
    function downloadBoard(board_id) {
        if (board_id) {
            var retry = 100,
                limit = 100;
            //get first pin data
            $.ajax({
                url: window.location.protocol + '//huaban.com/boards/' + board_id,
                async: false,
                success: function(res) {
                    try {
                        //console.log(res);
                        if (res.hasOwnProperty("board") === true) {
                            var board_data = res.board,
                                pin_number = board_data.pin_count,
                                board_pins = board_data.pins;
                            //console.log("Current board <" + board_id + "> pins number is " + pin_number + ", first pins number is " + board_pins.length);
                            if (board_pins.length < pin_number) {
                                var last_pin = board_pins[board_pins.length - 1].pin_id;
                                while (1 <= retry) {
                                    //get ajax pin data
                                    var board_next_url = window.location.protocol + "//huaban.com/boards/" + board_id + "/?max=" + last_pin + "&limit=" + limit + "&wfl=1";
                                    $.ajax({
                                        url: board_next_url,
                                        type: "GET",
                                        async: false,
                                        success: function(res) {
                                            //console.log(res);
                                            var board_next_data = res.board;
                                            board_pins = board_pins.concat(board_next_data.pins);
                                            console.log("ajax load board with pin_id " + last_pin + ", get pins number is " + board_next_data.pins.length + ", merged");
                                            if (board_next_data.pins.length === 0) {
                                                retry = 0;
                                                return false;
                                            }
                                            last_pin = board_next_data.pins[board_next_data.pins.length - 1].pin_id;
                                        }
                                    });
                                    retry -= 1;
                                }
                            }
                            //console.log("共抓取" + board_pins.length + "个pin");
                            var pins = [];
                            for (var i = 0, len = board_pins.length; i < len; i++) {
                                var pin = board_pins[i];
                                pins.push({
                                    imgUrl: "http://img.hb.aicdn.com/" + pin.file.key + "_fw658",
                                    imgName: pin.pin_id + "." + pin.file.type.split("/")[1]
                                });
                            }
                            //交互确定下载方式
                            interactive(board_id, pins);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        }
    }
    //用户解析与下载
    function downloadUser(user_id) {}
    /*
        分出不同模块：用户、画板
    */
    if (window.location.pathname.split('/')[1] === "boards") {
        //当前在画板地址下
        var board_id = window.location.pathname.split('/')[2];
        //定位
        var ab = document.getElementById('page').getElementsByClassName('action-buttons')[0];
        //插入下载画板按钮
        if (isContains(ab.innerText, "下载此画板") === false) {
            ab.insertAdjacentHTML('afterbegin', '<a href="#" id="downloadBoard" class="btn rbtn"><span class="text"> 下载此画板</span></a>');
        }
        //监听画板点击下载事件
        document.getElementById("downloadBoard").onclick = function() {};
    } else {
        //当前在用户主页下
        if (hasId("user_page") === true) {
            //根据user_page确定了是在用户主页
            var user_id = window.location.pathname.split('/')[1];
            //根据user_id循环ajax查询出所有画板
        }
    }
})();