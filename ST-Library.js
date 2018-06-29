/*
    @author       staugur
    @website      www.saintic.com
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
//保存图片
function saveImage(imgUrl, imgName) {
    /*
        imgUrl: 图片地址; imgName: 保存的文件名
        注意，使用此函数请先在用户脚本中：@require https://cdn.bootcss.com/FileSaver.js/1.3.2/FileSaver.min.js
    */
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