// ==UserScript==
// @name         花瓣网下载
// @namespace    https://www.saintic.com/
// @version      0.1
// @description  花瓣网(huaban.com)用户画板图片批量下载到本地
// @author       staugur
// @match        http*://huaban.com/boards/*
// @exclude      http*://huaban.com/pins/*
// @require      https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js
// @require      https://static.saintic.com/cdn/layer/3.1.1/layer.js
// @require      https://static.saintic.com/cdn/js/FileSaver.min.js
// @grant        GM_xmlhttpRequest
// @license      MIT
// @date         2018-05-23
// @modified     none
// @github       https://github.com/staugur/grab_huaban_board
// @supportURL   https://github.com/staugur/grab_huaban_board/issues
// ==/UserScript==

(function() {
    'use strict';
    //公共接口
    function isContains(str, substr) {
        /*判断str中是否包含substr*/
        return str.indexOf(substr) >= 0;
    }
    function saveImage(imgUrl, imgName) {
        /*下载保存图片*/
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
    function copyText(text) {
        var oInput = document.createElement('input');
        oInput.value = text;
        document.body.appendChild(oInput);
        oInput.select(); // 选择对象
        document.execCommand("Copy"); // 执行浏览器复制命令
        oInput.style.display='none';
        layer.msg('复制成功');
    }
    //定位
    var d = document.getElementById('page').getElementsByClassName('action-buttons')[0];
    //插入下载画板按钮
    if (isContains(d.innerText, "下载此画板") === false) {
        d.insertAdjacentHTML('afterbegin', '<a href="#" id="downloadBoard" class="btn rbtn"><span class="text"> 下载此画板</span></a>');
    }
    //下载图片函数
    function downloadPicLocally(pins) {
        /*本地下载*/
    }
    function downloadPicRemotely(pins) {
        /*远端下载*/
    }
    function downloadPicThunder(pins) {
        /*文本方式下载，比如迅雷*/
        var tip = '<b>请点击复制按钮，粘贴到迅雷下载！</b><br/>', str = '';
        for(var i = 0, len = pins.length; i < len ; i++) {
            s += pins[i].imgUrl;
        }
        layer.alert(tip + str, {title: "文本方式下载", btn: '复制', btnAlign:'c', icon: 1, yes: function(index, layero){
            copyText(str);
            layer.close(index); //如果设定了yes回调，需进行手工关闭
        }});
    }
    //监听点击下载事件
    document.getElementById("downloadBoard").onclick = function() {
        console.log("点击了下载画板按钮");
        var pathname = window.location.pathname.split('/');
        console.log(pathname);
        if (pathname[1] === "boards") {
            var retry = 100,
                limit = retry,
                headers = {
                    'X-Request': 'JSON',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': 'http://huaban.com',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
                };
            var board_id = pathname[2];
            var board_url = 'http://huaban.com/boards/' + board_id;
            //get first pin data
            $.ajax({
                url: board_url,
                type: "GET",
                async: false,
                success: function(res) {
                    try {
                        console.log(res);
                        if (res.hasOwnProperty("board") === true) {
                            //主要部分
                            var board_data = res.board,
                                pin_number = board_data.pin_count,
                                board_pins = board_data.pins;
                            console.log("Current board <" + board_id + "> pins number is " + pin_number + ", first pins number is " + board_pins.length);
                            if (board_pins.length < pin_number) {
                                var last_pin = board_pins[board_pins.length - 1].pin_id;
                                while (1 <= retry) {
                                    //get ajax pin data
                                    var board_next_url = "http://huaban.com/boards/" + board_id + "/?max=" + last_pin + "&limit=" + limit + "&wfl=1";
                                    $.ajax({
                                        url: board_next_url,
                                        type: "GET",
                                        async: false,
                                        success: function(res) {
                                            console.log(res);
                                            var board_next_data = res.board;
                                            board_pins += board_next_data.pins;
                                            console.log("ajax load board with pin_id " + last_pin + ", get pins number is " + board_next_data.pins.length + ", merged");
                                            if (board_next_data.pins.length < limit) {
                                                retry = 0;
                                                return false;
                                            }
                                            last_pin = board_next_data.pins[board_next_data.pins.length - 1].pin_id;
                                        }
                                    });
                                    retry -= 1;
                                }
                            }
                            console.log(board_pins);
                            var pins = [];
                            for(var i = 0, len = board_pins.length; i < len ; i++) {
                                var pin = board_pins[i];
                                console.log(pin);
                                pins.push({imgUrl: "http://img.hb.aicdn.com/"+pin.file.key+"_fw658", imgName: pin.pin_id + "." + pin.file.split("/")[1]});
                            }
                            //交互确定下载方式
                            downloadPicThunder(pins);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        }
    };
})();