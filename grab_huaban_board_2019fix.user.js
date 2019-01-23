// ==UserScript==
// @name         花瓣网下载-临时修复版-meitu.cn专用
// @namespace    https://www.saintic.com/
// @version      0.5.11
// @description  花瓣网(huaban.com)用户画板图片批量下载到本地
// @author       staugur
// @match        http*://*.meiwu.co/*
// @require      https://cdn.bootcss.com/FileSaver.js/1.3.2/FileSaver.min.js
// @grant        GM_setClipboard
// @grant        GM_info
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAAA+CAYAAACIll2bAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABlLSURBVHhe3VsJXFTV97/vvjdvFgaGZdh3EFAUkE1xQyVNUBEl19DUzC3DUHMtoqzUXELTXCtMNDW00jDNnUxNxVJEya3SXFBRQUFg3sy7/3PHx/xmAP37S7A+v+/n8/2I995z373nnXPuOe+9Qc8ChBAMVIgTJ3qKvXrF6hMSXhSfj08VuyXMEOPjZ+qTkzP0gwZNFEeOHCJOn96Z5Ob6wXgNkJemeCYoQMjvppV6i+G11+ZITY0D2BhDMjLUYljY84bAoFl6H/89gqt7saB1Ngh2jkTQaIlgbUcEK1siqDREUMPftM3Rleg9fIgQ0FSvj4y+oe+W8LMwZEiWfty4VHHp0hixrMwB5pZJl2kwlCBkc5eVvXOfk9/XuXrcFzMyIqSuhoXYtauV6OzcX6912qSzsSurttKQarkVqeaUf48yoMqGVIPidP6BRBfd+rbQJ/lHcfTYuXADepP8fC9QmIreEGkJTwzjTXR11ep4fvoDTl5cKVMRnZVNmRgSkvB35nscmCqeDxRU6oVVClVJpUJNKmFjjUZeRSo1DqTKy5dUh4RV6+KeK9IPGLhJP2LE28KUKcnVq1c3lyyNKk4GZM3Iiykprnpvv4GCvcMGWG9FzZw6heoscXNrKe2pQcDclckiHnCyTRW8QqiAC1HeA94CXpMpyFVgMfC21F4zpsEJN6XCVkseuHuRSv9Asap56L3q6NYXq9vHHqmO7bRH177DzuoWYXnVHt4XK+0chAqVtUm2HAg3eA3RaOykfT01mEK5vEkJx28slSkMpXABqoRzHP9gJ8tdTFepygfxfNUIjjuxnGU/XcuyX6zBODcbs8c2styf21hZ2QGO1//KyckFTkFugnwZkCrwWfIu8DbH/17C88kEISzt7emQgZDiPMfNuMHJy0vgAtdl8urTnGzHQYyHj5fJQt0dHD71cHWtttdoCmF4ByCGizN0AdDAf4OQ7XKE/DNZttMyjEevYtklKzHev5bl/trOyqqOgNLOgrJvSBtoDNIbcpXjb/zJcW/l29lpjBtrCGxDKPACKztYzNOLKHR/cdzqQzJZyFcIUd/mnB0dx7UICtLb29qWyzluLIjIH0o+GpLyuK0IaRcjFLUY41eWseyqFZjN38ByJXvA0o6D0s6B0q7DxuhNoe7635DKXAP+wcnFIpY/VYC5SRsRcpSW0CBgtrNsj/Mcf4sqp0TG/3RNJosEazKaJShH1q1z5+aRISGlUeHhxN/P7wg0+9G+vwOqtHOg3PUIeS5CqPNSjNNWsuznKzF7aB3LXc7lZPfzQHFHZXJyEniGujevIOclUmUWAU/J5OIvHH/3J1Z29EeWnb+N49otQEgpXabBgLeB+xTJ5JUlclXlA14xuTA42JS8gXKYyspK/xbBwXl9ExNJXKdOJKJly93Q5fRwxNOBzi+eOycnBQV2d1as0MCdt1+KUFAmQtRFUz7DeFIWw8yCOJe5meNW7lKrt/zo4rJhs1z+yqcc1+Z9hFxXICSTLLXeo/tR7U8CvAnjUad4he62lfqSaGfXBtosJoMNqLOysmaFt2hBUvr2Jb1BSZEREUehy/vhiL8HEhmp0Xt5DSlxd9942cnp9wfu7jvEgwfrKP0+Qs6VSmXqdSurFZesrd89LpcP/9PRsd3TbPqJkcWy/Y4rlFVl9tp8sXlzT6nZAqIoBk5KS8uPjYkh1IJeGT6cWtCf0BX1cMR/B5pPlalUn1yXK4oLZPLv92A8ASwhlh4O0hAjLiMUUspxWcUct+MMy3atcfdnhg9hg3lyxZ27bu4HxN69HaTmOgAFPT+of/+bz8fGksTnnyczpkwhYSEhFRjj/tBd+y7S/9sCqYua9zFXeD7oBs9nF8vl9y/J+CX7EGpCg7/Ub8IFUMwdjDeVsez1qxgPeiaWUhsjwM+38vyvxV4+v5JBg7RSc70AFxuWmJDwIKFzZ0KZPnUqdTHR0919JnRbxCpPT083a2vrr5VKJT3hqKLQMYgRV2WyT/5UKKpvyuWH70CqUN+mTyLkUcwwWRUsK1Rw3O5LCLlJXc8W1FTBtead9/C4Lg4bFiA1PxJgQa/26t69qntcHImHAD1+9GgS26EDaRkWBocQsnk4yjhOHtikyauebm6lbq6uOUGwwT84bsJZXn7nrJVaLFerF/zh7W3hRhT5EGDPYzzxLsZlgkwmVstki2ib1P3s8R5CbQ/Z298XkpNfkJoeC7CMUf369KmkyqEc/uKLpFfPnqRVdPQB6DbeZRjDBgQENAv087sJOVJFkpXV6lM8f/KEUkkuaDRVla6uI6iF0bHm2I9Qs0sYH6nGmAg8b9ArFJOkrn8GEyBH+JJX7LvVoUMOLJiTmh8LsIz+Y0aOLO8KVkMVNLBPH5IycCBpHR1dBN3NgIxWq3X19/Y+ptVodNOUypvH5Ar9UaWKnLd3qKhq1qx3fco5iNCQmxjf11PlKJV6vVo9Uur65zAf8oqjvr6VZO7cJ65oYXPt358581anNm2MCuoHJ9mwwYOpguhJRp+pBHi5ueUFOTjoVykU5BAo5rBKRYocHSuF0NCetZVDA/NBhplbirEoKcegd3CgMeufxWSErD+Vy08WJyV996TWQwFj/dZmZ59tGxn5UEG9epHBYEHREREQR9FQdxeXQx1dXERI3EielRU5ADzp5CRUt249oLZyaPzbzTCfwxFIqHL04IJ6R8dpUvc/i5ksm/ydl5dBP23aEKnpiQCbtP350KE8KDOMChqQlEQGvPAC8fPxuePq5HQl3tWVbIGN7lWrjTzi5EQqWrVKIxkZtfMWZivDzL9XoxxQqODisvgfOcZrgy5iNstuOBodXUWKinyk5icCKIi/ce3aWppJG2NQ795kEGTUEJBJG1DGV6CcndbWZBcwT6slt8PDl4JMnfwGSojXSyS30nMc0bu65sK6ntiSGxV/QJaawbKFF5OSLkLQtZaazaEGhgNp+WDxEJ1utry0dGFUy5ZiPORBiV27EmpN/vb2Ao0539vYkB3AH+zsyJXmzfPENWusJNEa4Gy1uu9fGOuNymFZIjg7nyZ+fg33GOJpUQgKmMFxFy8NG3aC5itSsxFUATZWVuPCQ0JKXF1cLqoUiinQbMpvaH/ZnTsfRoaFiT2ee460i4oiHlptRSbPl24BxWzTaIw8Exh4naSlWVT4/SAgf4px6lmMdUblAAWttqwKUgJpyL8DIkLyaSx7/NywYWdgwyqpmW4eX7hwoUVIUNC5QXB8T54wgURHRV2FrnYPRzx0sd9OnZofAS5GFeTu7Cy+oVLd3QRK2WJra+RBby99VVJSb0nECFAO/z1U4b9gbBBqlGNtLeoDA2mJ8ljQdQE5IH3e3Pg1GPg6TmeYNfsTEkrJgwdeUjPNcewXZWaubt+qFekFddbktDTSKiqqkmVZullj8IQxjgvnz8+JBctp2qQJSbazq1xvY02+BpeizHV1ISWxsRZxZw5Cmr08v24/uJNOUo6e54nB33+pNMQEGh9BliE9ethVh4T0ux7eMvNidPS2czExhy506nToygsv5Fakpn4gbt4cU9v6GxSzMX5xeUCAXr9unSnngAs2m/bGG2e6tG9PenbpQl4aNIhEhIWVQVe3hyOMY0ITu3c/3RGO+QiNRsxSq8Wv7O1JDqWDA/ktPPysuHGjvTQc7UCo6V6V6ti3cEo9qFEOKErv5VVIIiNN1ktBcyKo2KPOazRrDzk4lG+FoJ8Dgd44t9k1vvXyIj+3aSOUTJ6cKx4/3jju+ROUBdN4vviP18ZdEK9cMT7agM23S0tNLaZZcu+EBEKfFgYFBByHLmONBneWX7ZsWd+o0FC9Lyx+MeQ462DRXzo85J4m/nph6NB4OrYjnEgnZLIRO9Tqu5sgUYSK/KFygIKtbVl106amF3U0H/qF5wN+Uak2b7O1Fb8EJdTMWR/XwzV3giuf8fUlunbtivUtWvwgxMRs0CclpYsTJ9LD5ekBpsy/ifHXC319xdtvp/8g3rvnCAqKmjNrVnHntm3JC5Ahe3l46G1tbdNhuIKafb9+/TTBAQG7WwQGkvFwYq2Gxa6FO5wNXO/mRoq7dPkiPz9fdlMmi8hXKneD5ZTu4rjCy+bKsbEx6AMCXjK6Esy7Dw6MQxyXul2tvpdjrdZlK5W3FqlUlR9DTPsUFEXnruFarQPZD7nVLZmM6CmpJZrNTXMpfZMmBsPLL+eQpUuf/pVOHkKu6Rhvz/T3F6+kpf0sHDvW/fTp0wdjwH1SBgwgrq6ud2BYCpCmAhFuzs6baXDuDrnOKns7kuXoaORqYF5UlFjVunX67zY2uacUiqJjHDflI4Sa/4TxzZqgTDclBAWtl5TDzEbIbq9SufGwjc2tIp6flI1QUBZCLssQapWJ8dsfcNwvs1WqqoXUtcBiCkH+N5jnAtAUy+ojzciHDcuvJ8X47wFFotO7LLv2Xa1W2NetW0XpsmWFGzIzywf370+6wSmlVquvKOTyI85a7dUgSAZDIAFcCnd3lbOTBb+DgP2rtfXRApms/zyEjAtbzDCzIVM2mBbu41NcHh3tQvvmI+SZa2V19Ji39wXRz6/exyw0HVnOsj1yWfbWPpY1rAQlLXPUkrmgsEywFqj86yqnhpByGNLT4TINgBOwoXkYT34TYtI8Dw+yFU6xnZAAfgN1VnaPHmRRbCyZHRpK5kPfOgcHcamLC1lmxjU+3qQ4JGSR+cN9WFnTArAeuNMPs2W4q4aOHd+hfaBA7xyVqmBP06Cy6oEDHxkz1oGF/cbzPzxQKKZBYT1tskJR8bGzs/GadA0ZGhuyC+Y2WWgtCp06VZB16x77APCJQU1+PULN5jHMvA94vuAjlerGcmvr4s9sbX//QqPJX69QbP1YJjs7G9xpsZuriUtAaYVt2/4sXr5ser1Cg+53DLO/ysx6BH//KjJ0qMsksNgvlcrjWQEBpKxPnwk0tkliFqCuVqhQFOjc3GgMpOvjZjPMzMnW1nrz678H68mBUqVeJYHFiXPnNuxjE6qofIRUkKA4gRVol4CZ0yd6tPr/WKHInw/BONPd3cRNoaEGIS3teUnciLcQSr6OsWBaNARTQ/v23/dFSPm5XP7NAihoj3XufE48d86UoZuDXvc4y57S+ftvg/WYEsMzCDlMYtmCDyDXMl/D2xDAD5srxvy6I0eCIT4DzMI4ZZbWQZzr4U5qOM/Tg5xMSvwZrMD06JRazzcMc9zkWpSQQAq9evX6hOMmznNyEpc0bUrujR37piRiAZBX7GeYA9Xu7uWkXTtTEluDmRinT4MYZL4Oyrch5QCLraukxMQCSbTxQF/Evc/zee+BQmZ7epq4BE60ivHjJ0jDjBiF0HNwrP9HOZQhIecyeD74I41NySyQ+7ZtG4OYkxMqiVhgA8MsqaBZdrt2H0pNFpjDsl0n29jozNdBORViU6H5NWsYF3dLEm08QLUa8q5GUzHT25uYc0uHDjpx165AaZgRqxgmxyIeQL6kT0iY/hHHrXwb7jSV+6l377/A6oxvOcwxC6F4qPINgo+PTkxKqve93EKEWryhVpfXXstMXx+ymeZG5tem7NCh9FFxrsEA7vXGdIgbGT4+/yEs6OiAAQWQXJqCc0+IHQcxrjJfoODrq/+uWbMOMzWa2zVyp8aMOQKLtnhTMRRcaxfDnDPKtW+/TWqug0w4SCZbq+9brAU4G6z5K0g/zK9tZGzsNUm0cUCD5Dsy2Y4psIi3ILWvYUZQEPlr/Hg4bP6D1xEaW1ZrgYY2bfZ+gHHqVDhxjLKQS52fPHkPKMiiKn8fofGlVAZiiT4l5RWpuQ4gRkVMtdVUma+F8vOYGPK1RlNufm0j4+KOSaKNA3qiTFGrr03z9yPm/DA6iujS01+VhhmxGo52i8VBDabv2/c1UHDuJNgElZvu70+Kpk49bG5BkRDjtjHMn0YZ6K8cO/aRX4pksGzPKVqtWHs9+xISLm5Qqa5YXB9OMTgc1kiijYMZCMVMdXDQTYFM2ZxZHWOJmJ1NP5gyAopTl0NmD8KM9PfXX4uPD56kUv0x2Uz24KhRl8E1TRX/cPBOSAuMMkJ09N0VkZGyAyEho0h5uTHrNsccSBjTIPcyX8s7ISHkytChc7ZKr41MpDdo8OBxkmjjAI7VUWkQfybBQsz5dXy8jly/bnqeDafX8Lvmi6OMiSmEestngrV1qbns2sREg7h373OSKFrEMNmmwB4Xd2o+nFQXY2L2gBItn3aCu7/HcV+ngpuaz/dNu3Z3Pu7Ro8uJWqen4O0timPGBEnijQPIXhePhvjzOmS+5tyWnHwXNmD6PAXqrq/MF2dM0pKSVsyBoDoeYoO57LTwluTq3Ln0dZOCPhbZyjDFNXLlXbr8luPkdLZ85EiI25ZYgJA9uPsl87nSQ0NIcf/+GSMwHm6MYeaMijpJE19JvOFB79jbHPf9aLhLqYGBFtw+YEAJKKjmszb8tdkmjaTmPXbsKPrx01hr6/u15Vf27GkoX7UqfWRISATUbCa5ks6dxcMxMYfJ1asWD9MoIP50gXxHb5oHDord7dsXkX37bMEKv7RIL2hFHx+fJok2DuhHmG/I5fmjYTGvwmLM+V3//vdAQcZ38WAFTX4xXxylkxMRpk/vCmWKdpRCcXVMLflXIZte0q2bIatLl7MlZnJQYIriuHF1vnqnlvAxy66aZ7aWxeHhgjBkSBe4vmIHxnfMrw+1310xJaXeUqbBcBlqp9cViqKRsJnRtZidlGQQCwqM2XAyQi/cMluckRAnxIyMYNgYNwPjb4aAm9aeg3IUZMCmR7GUcIqJq1aZXhLUAJJVj+2OjjdSg4ONclNDQ8mlzp3n0HThZYR61QR5I2lyGhMzXRJtPIigoFRQ0MuwoFeaNbPgrK5dif6LL4xxYgxCUyvNF0gJY8R584yf5S1l2W4j1er7w+Cu157nFbA0C1maDb/66hbYuEXsyFEqFyyVZMZAUng4Onov2brV6IYrGWaTuXtBcvr79a5dn/5h2f8HuPv8BJ7PfwkW9TLcOXOOjYoiVxcs2Ejv4JsMs8jC/ylhTGVmpvGUo1a0AOO08VZWJa94eZEhoKghoPQxEGTT7O3EOqcfVOiGiRMzSUaGUQE7MR6U6+Eh0OuOaNGcbIXaDtzQ6N4pYFnHzLJ3wdZWFFu37k77Gh2wMfZNjLcOCAokQ5s3r8PcUaNuk+Jivw8Y5guLDVKCq5AlS0xfjcBcGDK2FpkYT1zJsp9ks+yiLRiPHc2ySUdry1JC2QA50U2dj8/uM3Z2+hGg0GFgORuCg/8iPXs2laZFcxlmlslFocgVAgI+k7qeDd5hmNkDfbzJYFhcbb4RF0dKly9fOIfjNtTZoKMjEebPt3h5+Agw7zNMXh0XBQqQKlzl+QdpkIUPhWQwx8/vfFVkpEk5QxBygNrvrnE8zZrd3M6IQUH1vUpvPCxg2e6DtVpdCiywPm4YPrz8s+Dggtqbo3dTnDbtXWmaxyIOIfcPGebASUj06IlGA/6fGF85gnHuDA+PynHg4vudnbeLvr7OkogRSxlmQY31CHZ290Q/vxZS17MDPabH8Pz5vuBSA0EhtfkSxKLZ8G+9bxkGDjwkTfMkwIkINZ+GUPd5CLXeKpO9+J6Hx71F7u43CpXK10jHjhZffrwFYwul2COo1YLg4fEk1trwgNhBXeDdfu7uYn84WutjP09PUieLpQuPjNSLa9b4SlM9EbIgp9lpZfXeTD8/4ZCv77cnnJ3rfEwOZY1sB8McpgeDoFSKOkdHi6L5mWMXQl7jwIqS4BTpGxZWh0mQvEEdVEdBxjcZM2aAQfz/oB9YXZPL4z93cTnxZmCgocDV9SNos/j0pgYbGWbufZjf+KGnlVXjZstPAmpFCzEePMTW9kFvsJhkUEptfl7f0zy6iQ4dysn69XU+0oL0gDX+JqNNm6Z/eHtPXOPj8wuNNQu9vUuu2NjU+VyvBhsRGnEDY4OO4yqrZbI69do/BlCSbBacaAMcHXW9QCG9W7a04Cittv6H5hCsIfH77XRKyueFycmf/JqYuOxA165fftO27f6VLVtee5O6aEQEeT0oyLDdwSHntkJR76NWiu8g7bmKsVCGcVEJQq2k5n8PaOlBlTTMzu5BDzjme4WHm9gTkr96X71QOjiQ3YMHk76tWpE+kZEkCRSSROVAsa+BO2U5OeWdhkK0vp8iUNB2SAbTL2F8qQjjSXQdUte/D9SSFmM8cJJCcWagp6chASwgETZLOc7OzrKuMico6VjfvmRo27aEZuYz3d3vrNVo1h9m2U70rYk0fR1AwRx8GeM95Sybd6+BfxTXaKAx6QeEnD7CeMw7PL8v1d6+ZKSnp/5Fb2+SRRO2+hREKZeTKkgLrnfsePK3hIS4fbWO7hrQmwAxJhaUkg3uVFXKsvOhrd6A/a8HfSSyFiHvj1g2bhnGw6Zi/NZmhrnz2K8v6Ce/Pj6iPizskqFVq21QUqwwhIUtFJo0WaV3dv5BUKlu6SDo38b4zF8IdZIu9b8DyIyDFzLM8Sv1KedRBMuj/9KPykHu91NQp1HlS1P+74G+qYBKe/ByKCF+xFhHlUVzF/pDFWpdlPTvciB9lgPB91Y+w6zfiVAvCMr/u4qpD89BUTkYDGsK5DDzwAVXMMwHWQzzHpTdkz5BaAB9W/q4QP1sgdD/AX2Kxwp17Bl5AAAAAElFTkSuQmCC
// @license      MIT
// @date         2018-05-25
// @modified     2019-01-23
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
    //由于@require方式引入jquery时layer使用异常，故引用cdn中jquery v1.10.1；加载完成后引用又拍云中layer v3.1.1
    addJS("https://cdn.bootcss.com/jquery/1.10.1/jquery.min.js", function() {
        addJS("https://static.saintic.com/cdn/layer/3.1.1/layer.js");
    });
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
        var downloadMethod = 0,
            msg = [
                '<div style="padding: 20px;"><b>当前画板共' + pin_number + '张图片，抓取了' + pins.length + '张，抓取率：' + calculatePercentage(pins.length, pin_number) + '！</b><small>提示: 只有登录后才可以抓取几乎所有图片哦。</small><br/>',
                '<b>请选择以下三种下载方式：</b><br/>',
                '1. <i>文本</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片地址按行显示，提供复制，粘贴至迅雷、QQ旋风等下载工具批量下载即可，推荐使用此方法。<br/>',
                '2. <i>本地</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片直接保存到硬盘中，由于是批量下载，所以浏览器设置中请关闭"下载前询问每个文件的保存位置"，并且允许浏览器下载多个文件的授权申请，以保证可以自动批量保存，否则每次保存时会弹出询问，对您造成困扰。<br/>',
                '3. <i>远程</i>： <br/>&nbsp;&nbsp;&nbsp;&nbsp;即所有图片将由远端服务器下载并压缩，提供压缩文件链接，直接下载此链接解压即可。<br/>',
                '<br/><p><b>寻求帮助？</b><a href="https://blog.saintic.com/blog/256.html" target="_blank" title="帮助文档" style="color: green;">请点击我！</a></p></div>'
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
                    saveImage(pin.imgUrl, pin.imgName);
                });
            },
            btn3: function(index, layero) {
                //远端下载
                downloadMethod = 3;
                layer.close(index);
                $.ajax({
                    url: "https://open.saintic.com/CrawlHuaban/",
                    type: "POST",
                    data: {
                        site: 1,
                        version: GM_info.script.version,
                        board_total: pin_number,
                        board_id: board_id,
                        user_id: user_id,
                        pins: JSON.stringify(pins),
                        email: getUrlQuery("email", "")
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
                                    if (!getUrlQuery("email", "")) {
                                        layer.prompt({
                                            title: '输入邮箱待下载完成后邮件提醒',
                                            icon: 1,
                                            shade: 0
                                        }, function(value, index, elem) {
                                            $.ajax({
                                                url: "https://open.saintic.com/CrawlHuaban/putEgg",
                                                type: "POST",
                                                data: {
                                                    downloadUrl: res.downloadUrl,
                                                    email: value
                                                },
                                                success: function(res) {
                                                    layer.close(index);
                                                    if (res.success === true) {
                                                        layer.msg(res.tip, {
                                                            icon: 1
                                                        });
                                                    } else {
                                                        layer.msg("远端服务提示: " + res.msg, {
                                                            icon: 2,
                                                            time: 8000
                                                        });
                                                    }
                                                }
                                            });
                                        });
                                    }
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
                $.ajax({
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
                '<br/><p><b>寻求帮助？</b><a href="https://blog.saintic.com/blog/256.html" target="_blank" title="帮助文档" style="color: green;">请点击我！</a></p></div>'
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
            var limit = 100;
            //get first pin data
            $.ajax({
                url: window.location.protocol + '//login.meiwu.co/boards/' + board_id,
                async: false,
                success: function(res) {
                    try {
                        //console.log(res);
                        if (res.hasOwnProperty("board") === true) {
                            var board_data = res.board,
                                pin_number = board_data.pin_count,
                                board_pins = board_data.pins,
                                user_id = board_data.user.urlname,
                                retry = Math.ceil(pin_number / limit);
                            console.debug("Current board <" + board_id + "> pins number is " + pin_number + ", first pins number is " + board_pins.length);
                            if (board_pins.length < pin_number) {
                                var last_pin = board_pins[board_pins.length - 1].pin_id;
                                while (1 <= retry) {
                                    //get ajax pin data
                                    var board_next_url = window.location.protocol + "//login.meiwu.co/boards/" + board_id + "/?max=" + last_pin + "&limit=" + limit + "&wfl=1";
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
                                    imgUrl: window.location.protocol + "//hbimg.b0.upaiyun.com/" + pin.file.key,
                                    imgName: pin.pin_id + "." + pin.file.type.split("/")[1]
                                };
                            })
                            //交互确定下载方式
                            interactiveBoard(board_id, pins, pin_number, user_id);
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
                url: window.location.protocol + '//login.meiwu.co/' + user_id,
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
                                    var user_next_url = window.location.protocol + "//login.meiwu.co/" + user_id + "/?max=" + last_board + "&limit=" + limit + "&wfl=1";
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
                            interactiveUser(user_id, boards, board_number);
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
            board_mobile_text = "下载";
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
                pab.insertAdjacentHTML('afterbegin', '<a href="javascript:;" id="downloadBoard" class="btn rbtn"><span class="text"> ' + board_text + '</span></a>');
            }
        }
        //监听画板点击下载事件
        document.getElementById("downloadBoard").onclick = function() {
            downloadBoard(board_id);
        };
    } else if (hasId("user_page") === true || hasId("people_card") === true) {
        //根据user_page确定了是在用户主页
        var user_id = window.location.pathname.split('/')[1],
            user_text = "下载此用户",
            user_mobile_text = "下载";
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
                    uca.insertAdjacentHTML('afterbegin', '<a href="#" id="downloadUser" class="btn rbtn"><span class="text"> ' + user_text + '</span></a>');
                }
            }
            //监听用户点击下载事件
            document.getElementById("downloadUser").onclick = function() {
                downloadUser(user_id);
            };
        }
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