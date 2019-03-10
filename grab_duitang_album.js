// ==UserScript==
// @name         堆糖网下载
// @namespace    https://www.saintic.com/
// @version      1.0.1
// @description  堆糖网(duitang.com)专辑图片批量下载到本地
// @author       staugur
// @match        http*://duitang.com/album/*
// @match        http*://www.duitang.com/album/*
// @grant        GM_setClipboard
// @grant        GM_info
// @grant        GM_download
// @icon         https://static.saintic.com/cdn/images/favicon-64.png
// @license      BSD 3-Clause License
// @date         2018-06-26
// @modified     2019-03-07
// @github       https://github.com/staugur/grab_huaban_board/blob/master/grab_duitang_album.js
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
    //设置提醒弹框
    function setupRemind() {
        var email = getReceiveBy('email') || '',
            mobile = getReceiveBy('mobile') || '',
            token = getReceiveBy('token') || '';
        var content_overview = [
            '<div style="padding: 30px; line-height: 22px; font-weight: 300;">',
            '<h3 style="color:red;font-weight: 400;">堆糖网下载脚本功能设置，包括提醒、公告等。</h3><br>',
            '<h5>提醒功能旨在提交远程下载后，查询下载进度并在下载完成发送邮箱、短信、微信等消息，以供用户下载。</h5>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;邮箱：<scan id="overview_email">' + (email || '未设置!') + '</scan></p>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;手机：<scan id="overview_mobile">' + (mobile || '未设置!') + '</scan></p>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;密钥：<scan id="overview_token">' + (setStarHidden(token) || '未设置!') + '</scan></p>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;微信：采用本站公众号，关注后，发送"@下载链接"即可查询状态。</p>',
            '<h5>公告功能目前支持清理缓存公告。</h5>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;<a id="reset_notice_status" href="javascript:;"><u>点击重置状态</u></a>：此操作将已读公告标记为未读，下次请求后会重新展示公告。</p>',
            '<h5>帮助说明。</h5>',
            '<p>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:;" id="grab_setting_help" title="查看帮助说明">点击查看FAQ</a>：关于设置方面的问题说明，请先阅读！</p>',
            '</div>'
        ].join("");
        var content_remind = [
            '<div style="padding: 30px; line-height: 22px; font-weight: 300;">',
            '<form><input class="ipt" id="set_remind_email" type="text" placeholder="邮箱" value="' + email + '"><a id="save_remind_email" class="abtn abtn-w4" href="javascript:;"><u>保存邮箱</u></a></form><br>',
            '<form><input class="ipt" id="set_remind_mobile" type="text" placeholder="手机号" value="' + mobile + '"><a id="save_remind_mobile" class="abtn abtn-w4" href="javascript:;"><u>保存手机</u></a></form><br>',
            '<form><input class="ipt" id="set_remind_token" type="text" placeholder="诏预开放平台密钥" value="' + token + '"><a id="save_remind_token" class="abtn abtn-w4" href="javascript:;"><u>保存密钥</u></a></form><br>',
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
                    var storage = new StorageMix("grab_duitang_album");
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
        var es = new StorageMix("grab_duitang_album_remind_email");
        var ms = new StorageMix("grab_duitang_album_remind_mobile");
        var ts = new StorageMix("grab_duitang_album_token");
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
            es = new StorageMix("grab_duitang_album_remind_email"),
            ms = new StorageMix("grab_duitang_album_remind_mobile"),
            ts = new StorageMix("grab_duitang_album_token");
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
        下载用户专辑接口
    */
    //交互确定专辑下载方式
    function interactiveAlbum(album_id, pins, pin_number, user_id) {
        var downloadMethod = 0,
            msg = [
                '<div style="padding: 20px;"><b>当前专辑共' + pin_number + '张图片，抓取了' + pins.length + '张，抓取率：' + calculatePercentage(pins.length, pin_number) + '！</b><br/>',
                '<b>请选择以下三种下载方式：</b><br/>',
                '1. <i>文本</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片地址按行显示，提供复制，粘贴至迅雷、QQ旋风等下载工具批量下载即可，推荐使用此方法。<br/>',
                '2. <i>本地</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片直接保存到硬盘中，由于是批量下载，所以浏览器设置中请关闭"下载前询问每个文件的保存位置"，并且允许浏览器下载多个文件的授权申请，以保证可以自动批量保存，否则每次保存时会弹出询问，对您造成困扰。<br/>',
                '3. <i>远程</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片将由远端服务器下载并压缩，提供压缩文件链接，直接下载此链接解压即可。<br/>',
                '<br/><p><b>寻求帮助？</b><a href="https://blog.saintic.com/blog/256.html" target="_blank" title="FAQ、彩蛋、文档等" style="color: green;">请点击我！</a></p></div>'
            ].join('');
        layer.open({
            type: 1,
            title: "选择专辑图片下载方式",
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
                        site: 2,
                        version: GM_info.script.version,
                        board_total: pin_number,
                        board_id: album_id,
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
                            var msg = ['<div style="padding: 20px;"><b>下载任务已经提交！</b><br>根据专辑图片数量，所需时间不等，请稍等数分钟后访问下载链接：<br><i><a href="',
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
                        site: 2,
                        version: GM_info.script.version,
                        total_number: pin_number,
                        pin_number: pins.length,
                        board_id: album_id,
                        user_id: user_id,
                        downloadMethod: downloadMethod
                    }
                });
            }
        });
    }
    //专辑解析与下载
    function downloadAlbum(album_id) {
        if (album_id) {
            console.group("堆糖网下载-当前专辑：" + album_id);
            var limit = 100,
                user_id = '';
            //get first pin data
            jQuery.ajax({
                url: "https://www.duitang.com/napi/blog/list/by_album/?album_id=" + album_id + "&limit=" + limit + "&start=0&_=" + Math.round(new Date()),
                async: false,
                success: function(res) {
                    try {
                        //console.log(res);
                        if (res.hasOwnProperty("data") === true) {
                            var album_data = res.data,
                                pin_number = album_data.total,
                                board_pins = album_data.object_list,
                                retry = Math.ceil(pin_number / limit);
                            console.debug("Current album <" + album_id + "> album number is " + pin_number + ", first get number is " + board_pins.length);
                            if (board_pins.length < pin_number) {
                                var next_start = album_data.next_start;
                                while (1 <= retry) {
                                    //get ajax pin data
                                    jQuery.ajax({
                                        url: "https://www.duitang.com/napi/blog/list/by_album/?album_id=" + album_id + "&limit=" + limit + "&start=" + next_start + "&_=" + Math.round(new Date()),
                                        async: false,
                                        success: function(res) {
                                            //console.log(res);
                                            var album_next_data = res.data;
                                            board_pins = board_pins.concat(album_next_data.object_list);
                                            console.debug("ajax load album with next_start " + next_start + ", get number is " + album_next_data.object_list.length + ", merged");
                                            if (album_next_data.object_list.length === 0) {
                                                retry = 0;
                                                return false;
                                            }
                                            next_start = album_next_data.next_start;
                                        }
                                    });
                                    retry -= 1;
                                }
                            }
                            if (board_pins.length > 0) {
                                user_id = board_pins[0].sender_id;
                            }
                            console.log("用户:" + user_id + "的专辑" + album_id + "共抓取" + board_pins.length + "个图片");
                            var pins = board_pins.map(function(pin) {
                                return {
                                    imgUrl: pin.photo.path,
                                    imgName: pin.id + "." + pin.photo.path.split(".")[pin.photo.path.split(".").length - 1]
                                };
                            });
                            //交互确定下载方式
                            interactiveAlbum(album_id, pins, pin_number, user_id);
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
            url: "https://open.saintic.com/CrawlHuaban/notice?catalog=3",
            type: "GET",
            success: function(res) {
                if (res.code === 0) {
                    var notices = res.data;
                    if (notices.length > 0) {
                        var storage = new StorageMix("grab_duitang_album");
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
        主入口，分出不同模块：用户、专辑
    */
    var album_id = getUrlQuery("id");
    if (album_id != undefined && /^[0-9]*$/.test(album_id)) {
        //当前在专辑地址下
        var board_text = "下载此专辑",
            setup_text = "堆糖网设置";
        //当前是PC版，不予支持Mobile版
        var caa = document.getElementById('content').getElementsByClassName('album-action')[0];
        //插入下载专辑按钮
        if (isContains(caa.innerText, board_text) === false) {
            var tmpHtml = '<a href="javascript:;" id="setupRemind" style="display:inline-block;vertical-align:middle;width:90px;height:32px;line-height:32px;text-align:center;background-color:green;color:#fff;font-size:14px;border-radius:20px;text-decoration:none;margin-right:20px;"><span>' + setup_text + '</span></a>' +
                '<a href="javascript:;" id="downloadAlbum" style="display:inline-block;vertical-align:middle;width:90px;height:32px;line-height:32px;text-align:center;background-color:green;color:#fff;font-size:14px;border-radius:20px;text-decoration:none;margin-right:20px;"><span>' + board_text + '</span></a>';
            caa.style.width = 'auto';
            caa.insertAdjacentHTML('afterbegin', tmpHtml);
        }
        // 监听设置提醒按钮
        document.getElementById('setupRemind').onclick = function() {
            setupRemind();
        }
        //监听专辑点击下载事件
        document.getElementById("downloadAlbum").onclick = function() {
            showNotice();
            downloadAlbum(album_id);
        };
    }
})();