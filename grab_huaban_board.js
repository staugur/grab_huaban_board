// ==UserScript==
// @name         花瓣网下载
// @namespace    https://www.saintic.com/
// @version      0.2
// @description  花瓣网(huaban.com)用户画板图片批量下载到本地
// @author       staugur
// @match        http*://huaban.com/boards/*
// @match        http*://huaban.com/*
// @exclude      http*://huaban.com/boards/*/edit/*
// @exclude      http*://huaban.com/boards/*/followers/*
// @exclude      http*://huaban.com/*/likes/*
// @exclude      http*://huaban.com/*/pins/*
// @exclude      http*://huaban.com/*/tags/*
// @exclude      http*://huaban.com/*/followers/*
// @exclude      http*://huaban.com/*/following/*
// @require      https://cdn.bootcss.com/FileSaver.js/1.3.2/FileSaver.min.js
// @grant        GM_setClipboard
// @license      MIT
// @date         2018-05-25
// @modified     2018-05-30
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
            console.error(e);
        }
    }
    //计算百分比
    function calculatePercentage(num, total) {
        //小数点后两位百分比
        return (Math.round(num / total * 10000) / 100.00 + "%");
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
        addJS("https://static.saintic.com/cdn/layer/3.1.1/layer.js");
    });
    /*
        下载用户画板接口
    */
    //交互确定画板下载方式
    function interactiveBoard(board_id, pins, pin_number) {
        var msg = [
            '<div style="padding: 20px;"><b>当前画板共' + pin_number + '张图片，抓取了' + pins.length + '张，抓取率：' + calculatePercentage(pins.length, pin_number) + '！</b><small>提示: 只有登录后才可以抓取几乎所有图片哦。</small><br/>',
            '<b>请选择以下三种下载方式：</b><br/>',
            '1. <i>文本</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片地址按行显示，提供复制，粘贴至迅雷、QQ旋风等下载工具批量下载即可，推荐使用此方法。<br/>',
            '2. <i>本地</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片直接保存到硬盘中，由于是批量下载，所以浏览器设置中请关闭"下载前询问每个文件的保存位置"，并且允许浏览器下载多个文件的授权申请，以保证可以自动批量保存，否则每次保存时会弹出询问，对您造成困扰。<br/>',
            '3. <i>远程</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片将由远端服务器下载并压缩，提供压缩文件链接，直接下载此链接解压即可。<br/>',
            '<br/><p><b>寻求帮助？</b><a href="https://www.saintic.com/blog/256.html" target="_blank" title="帮助文档" style="color: green;">请点击我！</a></p></div>'
        ].join('');
        layer.open({
            type: 1,
            title: "选择画板图片下载方式",
            content: msg,
            closeBtn: false,
            shadeClose: false,
            shade: 0,
            btn: ['文本', '本地', '远程'],
            btnAlign: 'c',
            zIndex: layer.zIndex,
            success: function(layero) {
                layer.setTop(layero);
            },
            yes: function(index, layero) {
                //文本方式下载，比如迅雷、QQ旋风
                layer.close(index);
                layer.open({
                    type: 1,
                    title: "文本方式下载",
                    content: '<div style="padding: 20px;"><b>请点击复制按钮，粘贴到迅雷等下载！</b></div>',
                    closeBtn: false,
                    shadeClose: false,
                    shade: 0,
                    btn: '复制',
                    btnAlign: 'c',
                    maxmin: true,
                    zIndex: layer.zIndex,
                    success: function(layero) {
                        layer.setTop(layero);
                    },
                    yes: function(index, layero) {
                        layer.close(index);
                        GM_setClipboard(pins.map(function(pin) {
                            return pin.imgUrl + "\n";
                        }).join(""));
                        layer.msg("复制成功", {
                            icon: 1
                        });
                    }
                });
            },
            btn2: function(index, layero) {
                //本地下载
                layer.close(index);
                pins.map(function(pin) {
                    saveImage(pin.imgUrl, pin.imgName);
                });
            },
            btn3: function(index, layero) {
                //远端下载
                layer.close(index);
                $.ajax({
                    url: "https://www.saintic.com/CrawlHuaban/",
                    type: "POST",
                    data: {
                        board_id: board_id,
                        pins: JSON.stringify(pins)
                    },
                    success: function(res) {
                        if (res.success === true) {
                            var msg = ['<div style="padding: 20px;"><b>下载任务已经提交！</b><br>根据画板图片数量，所需时间不等，请稍等数分钟后访问下载链接：<br><i><a href="',
                                res.downloadUrl + '" target="_blank">',
                                res.downloadUrl + '</a></i><br>它将于<b>',
                                res.expireTime + '</b>过期，那时资源会被删除，请提前下载。</div>'
                            ].join("");
                            layer.open({
                                type: 1,
                                title: "温馨提示",
                                content: msg,
                                closeBtn: false,
                                shadeClose: false,
                                shade: 0,
                                area: '390px',
                                btn: '我已知晓并复制下载链接',
                                btnAlign: 'c',
                                maxmin: true,
                                zIndex: layer.zIndex,
                                success: function(layero) {
                                    layer.setTop(layero);
                                },
                                yes: function(index, layero) {
                                    layer.close(index);
                                    GM_setClipboard(res.downloadUrl);
                                    layer.msg("复制成功", {
                                        icon: 1
                                    });
                                }
                            });
                        } else {
                            layer.msg("远端服务异常: " + res.msg, {
                                icon: 2
                            });
                        }
                    }
                });
            }
        });
    }
    //交互确定用户下载方式
    function interactiveUser(user_id, boards) {
        boards.map(function(board_id) {
            var msg = [
                '<div style="padding: 20px;"><b>当前画板是：' + board_id + '！</b><small>提示: 只有登录后才可以抓取几乎所有画板哦。</small><br/>',
                '<b>请选择以下两种功能按钮：</b><br/>',
                '1. <i>开始下载</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;点击此按钮将开始抓取画板图片，抓取完成后弹出下载方式，请选择某种方式后完成当前画板下载。<br/>',
                '2. <i>跳过</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即忽略此画板，并关闭本窗口。<br/>',
                '<br/><p><b>请注意：</b>用户存在多个画板时会弹出多个窗口，请移动或最小化当前窗口以显示其他窗口。</p>',
                '<br/><p><b>寻求帮助？</b><a href="https://www.saintic.com/blog/256.html" target="_blank" title="帮助文档" style="color: green;">请点击我！</a></p></div>'
            ].join('');
            layer.open({
                type: 1,
                title: "花瓣网用户抓取：" + user_id,
                content: msg,
                closeBtn: false,
                shadeClose: false,
                shade: 0,
                btn: ['开始下载', '跳过'],
                btnAlign: 'c',
                maxmin: true,
                zIndex: layer.zIndex,
                success: function(layero) {
                    layer.setTop(layero);
                },
                yes: function(index, layero) {
                    //按钮【开始下载】的回调
                    layer.close(index);
                    downloadBoard(board_id);
                },
                btn2: function(index, layero) {
                    //按钮【跳过】的回调
                    layer.close(index);
                }
            });
        });
    }
    //画板解析与下载
    function downloadBoard(board_id) {
        if (board_id) {
            console.group("花瓣网下载-当前画板：" + board_id);
            var limit = 100;
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
                                board_pins = board_data.pins,
                                retry = Math.ceil(pin_number / limit);
                            console.debug("Current board <" + board_id + "> pins number is " + pin_number + ", first pins number is " + board_pins.length);
                            if (board_pins.length < pin_number) {
                                var last_pin = board_pins[board_pins.length - 1].pin_id;
                                while (1 <= retry) {
                                    //get ajax pin data
                                    var board_next_url = window.location.protocol + "//huaban.com/boards/" + board_id + "/?max=" + last_pin + "&limit=" + limit + "&wfl=1";
                                    $.ajax({
                                        url: board_next_url,
                                        async: false,
                                        success: function(res) {
                                            //console.log(res);
                                            var board_next_data = res.board;
                                            board_pins = board_pins.concat(board_next_data.pins);
                                            console.debug("ajax load board with pin_id " + last_pin + ", get pins number is " + board_next_data.pins.length + ", merged");
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
                            console.log("画板" + board_id + "共抓取" + board_pins.length + "个pin");
                            var pins = board_pins.map(function(pin) {
                                return {
                                    imgUrl: "http://img.hb.aicdn.com/" + pin.file.key + "_fw658",
                                    imgName: pin.pin_id + "." + pin.file.type.split("/")[1]
                                };
                            })
                            //交互确定下载方式
                            interactiveBoard(board_id, pins, pin_number);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
            console.groupEnd();
        }
    }
    //用户解析与下载
    function downloadUser(user_id) {
        if (user_id) {
            console.group("花瓣网下载-当前用户：" + user_id);
            var limit = 10;
            //get first board data
            $.ajax({
                url: window.location.protocol + '//huaban.com/' + user_id,
                async: false,
                success: function(res) {
                    try {
                        //console.log(res);
                        if (res.hasOwnProperty("user") === true) {
                            var user_data = res.user,
                                board_number = user_data.board_count,
                                board_ids = user_data.boards,
                                retry = Math.ceil(board_number / limit);
                            console.debug("Current user <" + user_id + "> boards number is " + board_number + ", first boards number is " + board_ids.length);
                            if (board_ids.length < board_number) {
                                var last_board = board_ids[board_ids.length - 1].board_id;
                                while (1 <= retry) {
                                    //get ajax board data
                                    var user_next_url = window.location.protocol + "//huaban.com/" + user_id + "/?max=" + last_board + "&limit=" + limit + "&wfl=1";
                                    $.ajax({
                                        url: user_next_url,
                                        async: false,
                                        success: function(res) {
                                            //console.log(res);
                                            var user_next_data = res.user.boards;
                                            board_ids = board_ids.concat(user_next_data);
                                            console.debug("ajax load user with board_id " + last_board + ", get boards number is " + user_next_data.length + ", merged");
                                            if (user_next_data.length === 0) {
                                                retry = 0;
                                                return false;
                                            }
                                            last_board = user_next_data[user_next_data.length - 1].board_id;
                                        }
                                    });
                                    retry -= 1;
                                }
                            }
                            console.log("用户" + user_id + "共抓取" + board_ids.length + "个board");
                            var boards = board_ids.map(function(board) {
                                return board.board_id;
                            });
                            //交互确定下载方式
                            interactiveUser(user_id, boards);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
            console.groupEnd();
        }
    }
    /*
        分出不同模块：用户、画板
    */
    if (window.location.pathname.split('/')[1] === "boards") {
        //当前在画板地址下
        var board_id = window.location.pathname.split('/')[2];
        //定位
        var pab = document.getElementById('page').getElementsByClassName('action-buttons')[0];
        //插入下载画板按钮
        if (isContains(pab.innerText, "下载此画板") === false) {
            pab.insertAdjacentHTML('afterbegin', '<a href="#" id="downloadBoard" class="btn rbtn"><span class="text"> 下载此画板</span></a>');
        }
        //监听画板点击下载事件
        document.getElementById("downloadBoard").onclick = function() {
            downloadBoard(board_id);
        };
    } else {
        //当前在用户主页下
        if (hasId("user_page") === true) {
            //根据user_page确定了是在用户主页
            var user_id = window.location.pathname.split('/')[1];
            if (arrayContains(["all", "discovery", "favorite", "categories", "apps", "about", "search", "activities", "settings", "users"], user_id) === false) {
                //定位
                var uab = document.getElementById('user_page').getElementsByClassName('action-buttons')[0];
                //插入下载画板按钮
                if (isContains(uab.innerText, "下载此用户") === false) {
                    uab.insertAdjacentHTML('afterbegin', '<a href="#" id="downloadUser" class="btn rbtn"><span class="text"> 下载此用户</span></a>');
                }
                //监听用户点击下载事件
                document.getElementById("downloadUser").onclick = function() {
                    downloadUser(user_id);
                };
            }
        }
    }
})();