// ==UserScript==
// @name         花瓣网下载
// @namespace    https://www.saintic.com/
// @version      1.0.2
// @description  花瓣网(huaban.com)用户画板图片批量下载到本地
// @author       staugur
// @match        http*://huaban.com/*
// @match        http*://huabanpro.com/*
// @match        http*://*.meiwu.co/*
// @grant        GM_setClipboard
// @grant        GM_info
// @grant        GM_download
// @icon         https://static.saintic.com/cdn/images/favicon-64.png
// @license      BSD 3-Clause License
// @date         2018-05-25
// @modified     2019-03-09
// @github       https://github.com/staugur/grab_huaban_board/blob/master/grab_huaban_board.js
// @supportURL   https://blog.saintic.com/blog/256.html
// ==/UserScript==

(function() {
    'use strict';
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
    //获取url查询参数
    function getUrlQuery(key, acq) {
        /*
            获取URL中?之后的查询参数，不包含锚部分，比如url为http://passport.saintic.com/user/message/?status=1&Action=getCount
            若无查询的key，则返回整个查询参数对象，即返回{status: "1", Action: "getCount"}；
            若有查询的key，则返回对象值，返回值可以指定默认值acq：如key=status, 返回1；key=test返回acq
        */
        var str = location.search;
        var obj = {};
        if (str) {
            str = str.substring(1, str.length);
            // 以&分隔字符串，获得类似name=xiaoli这样的元素数组
            var arr = str.split("&");
            //var obj = new Object();
            // 将每一个数组元素以=分隔并赋给obj对象
            for (var i = 0; i < arr.length; i++) {
                var tmp_arr = arr[i].split("=");
                obj[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1]);
            }
        }
        return key ? obj[key] || acq : obj;
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
    //获取可使用域名
    function getEffectiveHost() {
        var host = window.location.host;
        if (!host) {
            host = document.domain;
        }
        if (!host) {
            host = "huaban.com";
        }
        if (isContains(host, "meiwu.co")) {
            host = "login.meiwu.co";
        } else if (isContains(host, "huabanpro.com")) {
            host = "huabanpro.com";
        } else {
            host = "huaban.com";
        }
        return host;
    }
    //时间戳转化为日期格式
    function formatUnixtimestamp(unixtimestamp) {
        var unixtimestamp = new Date(unixtimestamp * 1000);
        var year = 1900 + unixtimestamp.getYear();
        var month = "0" + (unixtimestamp.getMonth() + 1);
        var date = "0" + unixtimestamp.getDate();
        var hour = "0" + unixtimestamp.getHours();
        var minute = "0" + unixtimestamp.getMinutes();
        var second = "0" + unixtimestamp.getSeconds();
        return year + "-" + month.substring(month.length - 2, month.length) + "-" + date.substring(date.length - 2, date.length) +
            " " + hour.substring(hour.length - 2, hour.length) + ":" +
            minute.substring(minute.length - 2, minute.length);
    }
    //加星隐藏部分
    function setStarHidden(str) {
        if (str) {
            return str.substr(0, 4) + " **** " + str.substr(-4);
        }
    }
    //封装localStorage
    class StorageMix {

        constructor(key) {
            this.key = key;
            this.obj = window.localStorage;
            if (!this.obj) {
                console.error("浏览不支持localStorage");
                return false;
            }
        }

        //设置或跟新本地存储数据
        set(data) {
            if (data) {
                return this.obj.setItem(this.key, JSON.stringify(data));
            }
        }

        //获取本地存储数据
        get() {
            var data = null;
            try {
                data = JSON.parse(this.obj.getItem(this.key));
            } catch (e) {
                console.error(e);
            } finally {
                return data;
            }
        }

        clear() {
            //清除对象
            return this.obj.removeItem(this.key);
        }
    }
    //由于@require方式引入jquery时layer使用异常，故引用cdn中jquery v1.10.1；加载完成后引用又拍云中layer v3.1.1
    addJS("https://cdn.bootcss.com/jquery/1.10.1/jquery.min.js", function() {
        $.noConflict();
        addJS("https://static.saintic.com/cdn/layer/3.1.1/layer.js");
    });
    //加载优化
    var loadingLayer = null;
    // 设置提醒弹框
    function setupRemind() {
        var email = getReceiveBy('email') || '',
            mobile = getReceiveBy('mobile') || '',
            token = getReceiveBy('token') || '';
        var content_overview = [
            '<div style="padding: 30px; line-height: 22px; font-weight: 300;">',
            '<h4 style="color:red;font-weight: 400;">花瓣网下载脚本功能设置，包括提醒、公告等。</h4><br>',
            '<h5>提醒功能旨在提交远程下载后，查询下载进度并在下载完成发送邮箱、短信、微信等消息，以供用户下载。</h5>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;邮箱：<scan id="overview_email">' + (email || '未设置!') + '</scan></p>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;手机：<scan id="overview_mobile">' + (mobile || '未设置!') + '</scan></p>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;密钥：<code id="overview_token">' + (setStarHidden(token) || '未设置!') + '</code></p>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;微信：采用本站公众号，关注后，发送"@下载链接"即可查询状态。</p>',
            '<h5>公告功能目前支持清理缓存公告。</h5>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;<a id="reset_notice_status" href="javascript:;">点击重置状态</a>：将已读公告标记为未读，下次请求会重新展示公告。</p>',
            '<h5>帮助说明。</h5>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:;" id="grab_setting_help" title="查看帮助说明">点击查看FAQ</a>：关于设置方面的问题说明，请先阅读！</p>',
            '</div>'
        ].join("");
        var content_remind = [
            '<div style="padding: 30px; line-height: 22px; font-weight: 300;">',
            '<form><a id="save_remind_email" class="submit-btn btn rbtn" href="javascript:;">保存邮箱</a><input style="display:inline-block;height:28px;color:#777;background:#fcfcfc;border:1px solid #CCC;border-radius:2px;box-shadow:inset 0 1px 2px rgba(0,0,0,.05);-webkit-transition:color .2s linear,border-color .3s linear;" id="set_remind_email" type="text" placeholder="邮箱" value="' + email + '"></form>',
            '<p><form><a id="save_remind_mobile" class="submit-btn btn rbtn" href="javascript:;">保存手机</a><input style="display:inline-block;height:28px;color:#777;background:#fcfcfc;border:1px solid #CCC;border-radius:2px;box-shadow:inset 0 1px 2px rgba(0,0,0,.05);-webkit-transition:color .2s linear,border-color .3s linear;" id="set_remind_mobile" type="text" placeholder="手机号" value="' + mobile + '"></form></p>',
            '<p><form><a id="save_remind_token" class="submit-btn btn rbtn" href="javascript:;">保存密钥</a><input style="display:inline-block;height:28px;color:#777;background:#fcfcfc;border:1px solid #CCC;border-radius:2px;box-shadow:inset 0 1px 2px rgba(0,0,0,.05);-webkit-transition:color .2s linear,border-color .3s linear;" id="set_remind_token" type="text" placeholder="诏预开放平台密钥" value="' + token + '"></form></p>',
            '<p>微信下载进度查询：</p>',
            '<img src="https://static.saintic.com/cdn/images/gongzhonghao.jpg" width="150px" title="订阅消息二维码">',
            '</div>'
        ].join("");
        var content_weixin = [
            '<div style="padding: 30px; line-height: 22px; font-weight: 300;">',
            '<p>微信下载进度查询：</p>',
            '<p>&nbsp;&nbsp;请使用微信APP扫描此二维码并关注，发送"@下载链接"即可，服务器会返回下载进度。</p>',
            '<img src="https://static.saintic.com/cdn/images/gongzhonghao.jpg" width="150px" title="订阅消息二维码">',
            '</div>'
        ].join("");
        var content_help = [
            '<div style="padding: 20px;">',
            '<p><b>1. 什么是密钥？</b><br>&nbsp;&nbsp;答：密钥是在您在诏预开放平台创建的<i>Api Token</i>，与用户一一对应，拥有它可以访问平台公共接口、处理您账号的相关事务等，此处仅作为您使用此脚本查询远端下载记录，以便及时下载完成的压缩包，省去了复制下载链接等步骤。切记密钥不可泄露，否则可能造成账号风险！</p>',
            '<p><b>2. 怎么创建密钥？</b><br>&nbsp;&nbsp;答：请登录开放平台：<a href="https://open.saintic.com/control/" target="_blank">https://open.saintic.com</a>，在控制台处可以创建密钥（您可以使用QQ/微博/码云/GitHub等快捷登录）！</p>',
            '<p><b>3. 微信怎么查询下载进度？</b><br>&nbsp;&nbsp;答：请使用微信APP扫描此二维码并关注，发送"@下载链接"即可，服务器会返回下载状态。1</p>',
            '</div>'
        ].join("");
        layer.tab({
            area: ['550px', '450px'],
            maxmin: true,
            tab: [{
                title: '概述',
                content: content_overview
            }, {
                title: '设置提醒',
                content: content_remind
            }],
            success: function(layero, index) {
                var body = layer.getChildFrame('body', index);
                body.context.getElementById("save_remind_email").onclick = function() {
                    var value = body.context.getElementById("set_remind_email").value;
                    setupReceiveTo("email", value);
                    body.context.getElementById("overview_email").innerHTML = (value || '已清空');
                }
                body.context.getElementById("save_remind_mobile").onclick = function() {
                    var value = body.context.getElementById("set_remind_mobile").value;
                    setupReceiveTo("mobile", value);
                    body.context.getElementById("overview_mobile").innerHTML = (value || '已清空');
                }
                body.context.getElementById("reset_notice_status").onclick = function() {
                    var storage = new StorageMix("grab_huaban_board");
                    storage.clear();
                    layer.msg("重置成功", {
                        icon: 1
                    });
                }
                body.context.getElementById("save_remind_token").onclick = function() {
                    var value = body.context.getElementById("set_remind_token").value;
                    setupReceiveTo("token", value);
                    body.context.getElementById("overview_token").innerHTML = (!value) ? '已清空' : setStarHidden(value);
                }
                body.context.getElementById("grab_setting_help").onclick = function() {
                    layer.open({
                        type: 1,
                        title: "FAQ",
                        content: content_help,
                        closeBtn: false,
                        shadeClose: false,
                        shade: 0,
                        btn: '我知道了',
                        btnAlign: 'c',
                        zIndex: layer.zIndex,
                        success: function(layero) {
                            layer.setTop(layero);
                        },
                        yes: function(index, layero) {
                            layer.close(index);
                        }
                    });
                }
            }
        });
    }
    /**
     * 设置接收信息
     * @param type 参数: mobile|email|token
     */
    function setupReceiveTo(type, value) {
        var es = new StorageMix("grab_huaban_board_remind_email");
        var ms = new StorageMix("grab_huaban_board_remind_mobile");
        var ts = new StorageMix("grab_huaban_board_token");
        if (type === 'email') {
            var isEmail = /^[\w.\-]+@(?:[a-z0-9]+(?:-[a-z0-9]+)*\.)+[a-z]{2,3}$/i;
            if (value) {
                if (!isEmail.test(value)) {
                    layer.msg('请输入正确的邮箱地址');
                    return;
                }
                es.set(value);
                layer.msg('邮箱：' + value + '，设置成功！', {
                    icon: 1
                });
            } else {
                es.clear();
                layer.msg('邮箱已清空！', {
                    icon: 1
                });
            }
        } else if (type === 'mobile') {
            var isMobile = /^1\d{10}$/i;
            if (value) {
                if (!isMobile.test(value)) {
                    layer.msg('请输入正确的手机号');
                    return;
                }
                ms.set(value);
                layer.msg('手机号：' + value + '，设置成功！', {
                    icon: 1
                });
            } else {
                ms.clear();
                layer.msg('手机号已清空！', {
                    icon: 1
                });
            }
        } else if (type === 'token') {
            if (!value) {
                ts.clear();
                layer.msg('密钥已清空！', {
                    icon: 1
                });
            } else {
                ts.set(value);
                layer.msg('密钥：' + value + '，设置成功！', {
                    icon: 1
                });
            }
        } else {
            layer.msg('暂不支持此方式！');
            return;
        }
    }
    /**
     * 读取接收信息值
     * @param type 参数: mobile|email|token
     */
    function getReceiveBy(type) {
        var str = '',
            es = new StorageMix("grab_huaban_board_remind_email"),
            ms = new StorageMix("grab_huaban_board_remind_mobile"),
            ts = new StorageMix("grab_huaban_board_token");
        if (type === 'email') {
            str = es.get();
        } else if (type === 'mobile') {
            str = ms.get();
        } else if (type === 'token') {
            str = ts.get();
        }
        return str || "";
    }
    /*
        下载用户画板接口
    */
    //交互确定画板下载方式
    function interactiveBoard(board_id, pins, pin_number, user_id) {
        /*
            board_id int: 画板id
            pins list: 包含所有程序加载到的图片数据
            pin_number int: 这个画板总共有多少图片
            user_id str: 这个画板所属的用户
        */
        layer.close(loadingLayer);
        var downloadMethod = 0,
            msg = [
                '<div style="padding: 20px;"><b>当前画板共' + pin_number + '张图片，抓取了' + pins.length + '张，抓取率：' + calculatePercentage(pins.length, pin_number) + '！</b><small>提示: 只有登录后才可以抓取几乎所有图片哦。</small><br/>',
                '<b>请选择以下三种下载方式：</b><br/>',
                '1. <i>文本</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片地址按行显示，提供复制，粘贴至迅雷、QQ旋风等下载工具批量下载即可，推荐使用此方法。<br/>',
                '2. <i>本地</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片直接保存到硬盘中，由于是批量下载，所以浏览器设置中请关闭"下载前询问每个文件的保存位置"，并且允许浏览器下载多个文件的授权申请，以保证可以自动批量保存，否则每次保存时会弹出询问，对您造成困扰。<br/>',
                '3. <i>远程</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片将由远端服务器下载并压缩，提供压缩文件链接，直接下载此链接解压即可。<br/>',
                '<br/><p><b>寻求帮助？</b><a href="https://blog.saintic.com/blog/256.html" target="_blank" title="FAQ、彩蛋、文档等" style="color: green;">请点击我！</a></p></div>'
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
                downloadMethod = 1;
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
                downloadMethod = 2;
                layer.close(index);
                pins.map(function(pin) {
                    GM_download(pin.imgUrl, pin.imgName);
                });
            },
            btn3: function(index, layero) {
                //远端下载
                downloadMethod = 3;
                layer.close(index);
                // 提醒接收配置信息读取
                var email = getUrlQuery("email", getReceiveBy('email'));
                var mobile = getUrlQuery("sms", getReceiveBy('mobile'));
                jQuery.ajax({
                    url: "https://open.saintic.com/CrawlHuaban/",
                    type: "POST",
                    data: {
                        site: 1,
                        version: GM_info.script.version,
                        board_total: pin_number,
                        board_id: board_id,
                        user_id: user_id,
                        pins: JSON.stringify(pins),
                        email: email,
                        sms: mobile
                    },
                    beforeSend: function(request) {
                        request.setRequestHeader("Authorization", "Token " + getReceiveBy('token'));
                    },
                    success: function(res) {
                        if (res.success === true) {
                            var msg = ['<div style="padding: 20px;"><b>下载任务已经提交！</b><br>根据画板图片数量，所需时间不等，请稍等数分钟后访问下载链接：<br><i><a href="',
                                res.downloadUrl + '" target="_blank">',
                                res.downloadUrl + '</a></i><br>它将于<b>',
                                res.expireTime + '</b>过期，那时资源会被删除，请提前下载。',
                                res.tip + '</div>'
                            ].join("");
                            layer.open({
                                type: 1,
                                title: "温馨提示",
                                content: msg,
                                closeBtn: false,
                                shadeClose: false,
                                shade: 0,
                                area: '350px',
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
                                    var tips = '复制成功！';
                                    if (email) {
                                        tips += ' 接收提醒邮箱:' + email;
                                    }
                                    if (mobile) {
                                        tips += ' 接收提醒手机:' + mobile;
                                    }
                                    layer.msg(tips, {
                                        icon: 1
                                    });
                                }
                            });
                        } else {
                            layer.msg("远端服务提示: " + res.msg, {
                                icon: 2,
                                time: 8000
                            });
                        }
                    }
                });
            },
            end: function() {
                jQuery.ajax({
                    url: "https://open.saintic.com/CrawlHuaban/putClick",
                    type: "POST",
                    data: {
                        site: 1,
                        version: GM_info.script.version,
                        total_number: pin_number,
                        pin_number: pins.length,
                        board_id: board_id,
                        user_id: user_id,
                        downloadMethod: downloadMethod
                    }
                });
            }
        });
    }
    //交互确定用户下载方式
    function interactiveUser(user_id, boards, board_number) {
        boards.map(function(board_id) {
            var msg = [
                '<div style="padding: 20px;"><b>当前画板是：' + board_id + '！</b><small>提示: 只有登录后才可以抓取几乎所有画板哦。</small><br/>',
                '<b>请选择以下两种功能按钮：</b><br/>',
                '1. <i>开始下载</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;点击此按钮将开始抓取画板图片，抓取完成后弹出下载方式，请选择某种方式后完成当前画板下载。<br/>',
                '2. <i>跳过</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即忽略此画板，并关闭本窗口。<br/>',
                '<br/><p><b>请注意：</b>用户存在多个画板时会弹出多个窗口，请移动或最小化当前窗口以显示其他窗口。</p>',
                '<br/><p><b>寻求帮助？</b><a href="https://blog.saintic.com/blog/256.html" target="_blank" title="FAQ、彩蛋、文档等" style="color: green;">请点击我！</a></p></div>'
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
        layer.open({
            type: 1,
            title: "温馨提示",
            content: '<div style="padding: 20px;"><b>当前用户画板数量总共为' + board_number + '个，抓取了' + boards.length + '个，抓取率：' + calculatePercentage(boards.length, board_number) + '！</b><br/><b>寻求帮助？Bug反馈？</b><a href="https://blog.saintic.com/blog/256.html" target="_blank" title="帮助文档" style="color: green;">请点击我！</a></div>',
            closeBtn: false,
            shadeClose: false,
            shade: 0,
            btn: '我已知晓',
            btnAlign: 'c',
            zIndex: layer.zIndex,
            success: function(layero) {
                layer.setTop(layero);
            },
            yes: function(index, layero) {
                //按钮【我已知晓】的回调
                layer.close(index);
            }
        });
    }
    //画板解析与下载
    function downloadBoard(board_id) {
        if (board_id) {
            console.group("花瓣网下载-当前画板：" + board_id);
            var limit = 100,
                loadingLayer = layer.load(0, {
                    time: 5000
                });
            //get first pin data
            jQuery.ajax({
                url: window.location.protocol + '//' + getEffectiveHost() + '/boards/' + board_id,
                async: false,
                success: function(res) {
                    try {
                        //console.log(res);
                        if (res.hasOwnProperty("board") === true) {
                            var board_data = res.board,
                                //画板图片总数
                                pin_number = board_data.pin_count,
                                board_pins = board_data.pins,
                                user_id = board_data.user.urlname,
                                //尝试向上取整，计算加载完画板图片需要的最大次数
                                retry = board_pins.length < pin_number ? Math.ceil(pin_number / limit) : 0;
                            console.debug("Current board <" + board_id + "> pins number is " + pin_number + ", first pins number is " + board_pins.length + ", retry is " + retry);
                            var bf = setInterval(function() {
                                if (retry > 0) {
                                    //说明没有加载完画板图片，需要ajax请求
                                    var last_pin = board_pins[board_pins.length - 1].pin_id;
                                    //get ajax pin data
                                    var board_next_url = window.location.protocol + "//" + getEffectiveHost() + "/boards/" + board_id + "/?max=" + last_pin + "&limit=" + limit + "&wfl=1";
                                    jQuery.ajax({
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
                                    retry--;
                                } else {
                                    console.log("画板" + board_id + "共抓取" + board_pins.length + "个pin");
                                    var pins = board_pins.map(function(pin) {
                                        var suffix = (!pin.file.type) ? "png" : pin.file.type.split("/")[1];
                                        return {
                                            imgUrl: window.location.protocol + "//hbimg.b0.upaiyun.com/" + pin.file.key,
                                            imgName: pin.pin_id + "." + suffix
                                        };
                                    })
                                    //交互确定下载方式
                                    interactiveBoard(board_id, pins, pin_number, user_id);
                                    clearInterval(bf);
                                }
                            }, 200);
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
            jQuery.ajax({
                url: window.location.protocol + '//' + getEffectiveHost() + '/' + user_id,
                async: false,
                success: function(res) {
                    try {
                        //console.log(res);
                        if (res.hasOwnProperty("user") === true) {
                            var user_data = res.user,
                                board_number = user_data.board_count,
                                board_ids = user_data.boards,
                                retry = board_ids.length < board_number ? Math.ceil(board_number / limit) : 0;
                            console.debug("Current user <" + user_id + "> boards number is " + board_number + ", first boards number is " + board_ids.length + ", retry is" + retry);
                            var uf = setInterval(function() {
                                if (retry > 0) {
                                    var last_board = board_ids[board_ids.length - 1].board_id;
                                    //get ajax board data
                                    var user_next_url = window.location.protocol + "//" + getEffectiveHost() + "/" + user_id + "/?max=" + last_board + "&limit=" + limit + "&wfl=1";
                                    jQuery.ajax({
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
                                    retry--;
                                } else {
                                    console.log("用户" + user_id + "共抓取" + board_ids.length + "个board");
                                    var boards = board_ids.map(function(board) {
                                        return board.board_id;
                                    });
                                    //交互确定下载方式
                                    interactiveUser(user_id, boards, board_number);
                                    clearInterval(uf);
                                }
                            }, 200);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
            console.groupEnd();
        }
    }
    //获取公告接口
    function showNotice() {
        jQuery.ajax({
            url: "https://open.saintic.com/CrawlHuaban/notice?catalog=2",
            type: "GET",
            success: function(res) {
                if (res.code === 0) {
                    var notices = res.data;
                    if (notices.length > 0) {
                        var storage = new StorageMix("grab_huaban_board");
                        var localIds = storage.get() || [];
                        var html = "";
                        notices.map(function(notice) {
                            //notice{id, ctime, content}
                            if (!arrayContains(localIds, notice.id) === true) {
                                localIds.push(notice.id);
                                html += "<p><b><i>@" + formatUnixtimestamp(notice.ctime) + "</i></b> 【 " + notice.content + " 】</p>";
                            }
                        });
                        storage.set(localIds);
                        if (!html) {
                            return false;
                        }
                        layer.open({
                            type: 1,
                            title: '诏预开放平台公告',
                            closeBtn: false,
                            area: 'auto',
                            shade: 0,
                            id: 'grab_huaban_board', //设定一个id，防止重复弹出
                            resize: true,
                            maxmin: true,
                            btn: ['我知道了'],
                            btnAlign: 'c',
                            moveType: 1, //拖拽模式，0或者1
                            content: '<div style="padding: 30px; line-height: 22px; background-color: #393D49; color: #fff; font-weight: 300;">' + html + '</div>',
                            yes: function(index, layero) {
                                layer.close(index);
                            }
                        });
                    }
                }
            }
        });
    }
    /*
        主入口，分出不同模块：用户、画板，监听并刷新URL
    */
    //当前URL
    var initUrl = window.location.href;
    //判断UA是否为移动端
    var isMobile = ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone|Opera Mini)/i))) ? true : false;
    if (window.location.pathname.split('/')[1] === "boards") {
        //当前在画板地址下
        var board_id = window.location.pathname.split('/')[2],
            board_text = "下载此画板",
            board_mobile_text = "下载",
            setup_text = "花瓣网设置";
        if (isMobile && hasId("mobile_board_page")) {
            //当前是移动版
            var bca = document.getElementById('board_card').getElementsByTagName("a"),
                brpx = "10px";
            if (bca.length <= 1) {
                bca = bca[0];
            } else {
                bca = bca[1];
                if (isContains(bca.innerText, "已关注")) {
                    brpx = "116px";
                } else {
                    brpx = "103px";
                }
            }
            if (isContains(bca.innerText, board_mobile_text) === false) {
                bca.insertAdjacentHTML('afterEnd', '<a href="javascript:;" id="downloadBoard" class="btn rbtn" style="position:absolute;right:' + brpx + ';top:22px;"><span class="text"> ' + board_mobile_text + '</span></a>');
            }
        } else {
            //当前是PC版
            var pab = document.getElementById('board_card').getElementsByClassName('action-buttons')[0];
            //插入下载画板按钮
            if (isContains(pab.innerText, board_text) === false) {
                var tmpHtml = '<a href="javascript:;" id="setupRemind" class="btn rbtn"><span class="text"> ' + setup_text + '</span></a>' +
                    '<a href="javascript:;" id="downloadBoard" class="btn rbtn"><span class="text"> ' + board_text + '</span></a>';
                pab.insertAdjacentHTML('afterbegin', tmpHtml);
            }
        }
        //监听画板点击下载事件
        document.getElementById("downloadBoard").onclick = function() {
            //展示公告
            showNotice();
            downloadBoard(board_id);
        };
    } else if (hasId("user_page") === true || hasId("people_card") === true) {
        //根据user_page确定了是在用户主页
        var user_id = window.location.pathname.split('/')[1],
            user_text = "下载此用户",
            user_mobile_text = "下载",
            setup_text = "花瓣网设置";
        if (arrayContains(["all", "discovery", "favorite", "categories", "apps", "about", "search", "activities", "settings", "users", "friends", "partner", "message", "muse", "login", "signup", "go", "explore"], user_id) === false) {
            //排除以上数组中的二级目录
            if (isMobile && hasId("people_card")) {
                //当前是移动版
                var pca = document.getElementById('people_card').getElementsByTagName("a"),
                    urpx = "10px";
                if (pca.length <= 2) {
                    pca = pca[1];
                } else {
                    pca = pca[2];
                    if (isContains(pca.innerText, "已关注")) {
                        urpx = "85px";
                    } else {
                        urpx = "68px";
                    }
                }
                if (isContains(pca.innerText, user_mobile_text) === false) {
                    pca.insertAdjacentHTML('afterEnd', '<a href="#" id="downloadUser" class="btn rbtn" style="position:absolute;right:' + urpx + ';top:30px;"><span class="text"> ' + user_mobile_text + '</span></a>');
                }
            } else {
                //当前是PC版
                var uca = document.getElementById('user_card').getElementsByClassName('action-buttons')[0];
                //插入下载用户画板按钮
                if (isContains(uca.innerText, user_text) === false) {
                    var tmpHtml = '<a href="javascript:;" id="setupRemind" class="btn rbtn"><span class="text"> ' + setup_text + '</span></a>' +
                        '<a href="javascript:;" id="downloadUser" class="btn rbtn"><span class="text"> ' + user_text + '</span></a>';
                    uca.insertAdjacentHTML('afterbegin', tmpHtml);
                }
            }
            //监听用户点击下载事件
            document.getElementById("downloadUser").onclick = function() {
                //展示公告
                showNotice();
                downloadUser(user_id);
            };
        }
    }
    // 监听设置提醒按钮
    document.getElementById('setupRemind').onclick = function() {
        setupRemind();
    }
    //采用循环方式判断url变化
    setInterval(function() {
        if (window.location.href != initUrl) {
            if (hasId("downloadBoard") === false && hasId("downloadUser") === false) {
                if (window.location.pathname.split('/')[1] != "pins") {
                    window.location.reload();
                }
            }
        }
    }, 1000);
})();