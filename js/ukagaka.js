$(document).ready(function() {
    $("#show_ukagaka").click(function() {
        if ($(this).text() == "隐藏春菜") {
            Ukagaka.setFace(3);
            Ukagaka.close()
            $(this).text("显示春菜")
        } else {
            Ukagaka.setFace(2);
            Ukagaka.show();
            $(this).text("隐藏春菜")
                //Ukagaka.tools.setCookie("is_closechuncai", '', 60 * 60 * 24 * 30 * 1000);
        }
    })
})

var Ukagaka = {

    data: {
        talktime: 0,
        talkself_duration: 5000, //设置自言自语频率（单位：秒）
        talkself_obj: {},
        tsi: 0,

        timenum: 0,
        tol: 0,
        //10分钟后页面没有响应就停止活动
        goal: 10 * 60,
        //_typei: 0,

        //春菜的话语
        //weichuncai_text: '',

        site_path: "", //基础路径
        //_weichuncai_path: "data.json", //请求的数据文件地址
        imagewidth: '240', //伪春菜的大小
        imageheight: '240', //伪春菜的大小

        ghost_name: "default",
        ghost: {},

        talkself: [
            //话语，脸部的表情
            ["白日依山尽，黄河入海流，欲穷千里目，更上.....一层楼？", "1"],
            ["我看见主人熊猫眼又加重了！", "3"],
            ["我是不是很厉害呀～～？", "2"],
            ["5555...昨天有个小孩子跟我抢棒棒糖吃.....", "3"],
            ["昨天我好像看见主人又在众人之前卖萌了哦～", "2"]
        ]
    },
    //加载ghost
    loadGhost: function() {
        $.getScript(Ukagaka.data.site_path + "ghost/" + Ukagaka.data.ghost_name + "/ghost.js").done(function() {
            if (ghost && ghost.action) {
                //初始化ghost
                ghost.init(Ukagaka);
                //初始化ghost中的faces
                initFaces(ghost.data.faces)
                Ukagaka.data.ghost = ghost;

                Ukagaka.build();
                return true;
            } else {
                Ukagaka.say("角色" + Ukagaka.data.ghost + "初始化失败！请联系管理员");
                return false;
            }
        }).fail(function(jqxhr, settings, exception) {
            Ukagaka.say("加载角色" + Ukagaka.data.ghost + "失败！请联系管理员");
            return false;
        });
    },

    //加载ghost表情
    loadGhostFaces: function(faces) {
        var html = '<div class="ukagaka_faces">';
        for (var i in faces) {
            html += '<img class="temp_face' + i + '" src="' + Ukagaka.data.site_path + "ghost/" + Ukagaka.data.ghost_name + "/" + faces[i] + '" />';
        }
        html += '</div>';

        $("head").append(html);
        //this.setFace(1);
    },
    //加载ghost菜单
    loadGhostMenu: function() {
        var menu_html = "";
        for (var i = this.data.ghost.action.length - 1; i >= 0; i--) {
            menu_html += '<ul class="entity" id="' + this.data.ghost.action[i][0] + '">' + this.data.ghost.action[i][1] + '</ul>';
        };
        $(".ukagaka .bubble .dialog .menu").prepend(menu_html);

        $("#ukagaka_menu").click(function() {
            Ukagaka.showMenu();
            Ukagaka.setFace(1);
        });

        //show or close ukagaka
        // $(".ukagaka .bubble .dialog .menu").click(function() {
        //     Ukagaka.setFace(3);
        //     Ukagaka.close();
        // });
        // $(".wcc.callchuncai").click(function() {
        //     Ukagaka.setFace(2);
        //     Ukagaka.callchuncai();
        //     Ukagaka.tools.setCookie("is_closechuncai", '', 60 * 60 * 24 * 30 * 1000);
        // });

        $('.ukagaka .bubble .dialog .menu .entity').click(function() {
            var event = this.id;
            if (Ukagaka.data.ghost[event]) {
                Ukagaka.data.ghost[event]();
                return;
            }

            // if (Ukagaka[event]) {
            //     Ukagaka[event]();
            //     return;
            // }
        });

        // $(".wcc .chuncaiface").mousemove(function() {
        //  Ukagaka.stoptime();
        //  Ukagaka.data.tol = 0;
        //  Ukagaka.setTime();
        //  Ukagaka.say("啊，野生的主人出现了！ ～～～O口O");
        // });
        this.talkSelf();

        // $(".ukagaka").mouseover(function() {
        //     if (this.data.talkself_obj) {
        //         clearTimeout(this.data.talkself_obj);
        //     }
        //     //Ukagaka.data.talktime = 0;
        //     Ukagaka.talkSelf();
        // });

        //判断春菜是否处于隐藏状态
        // var is_closechuncai = this.tools.getCookie("is_closechuncai");
        // if (is_closechuncai == 'close') {
        //     this.closechuncai_init();
        // }
        //设置初始状态
        // if (this.data.this_ghost['shownotice']) {
        //     this.data.this_ghost.shownotice();
        // }
        this.setFace(1);
        //this.closeMenu();
    },

    init: function(data) {
        this.data = this.tools.composition(this.data, data);
        // if (this.data.talkself_user) {
        //     this.data.talkself_arr = this.data.talkself_arr.concat(this.data.talkself_user);
        //     delete this.data.talkself_user;
        // }

        var ukagaka_html = '\
        <div class="ukagaka" onfocus="this.blur();" style="color:#626262;z-index:999;">\
            <div class="bubble">\
                <div class="top">\
                    <div class="tools">\
                        <a href="javascript:void(0);" id="ukagaka_menu">\
                            <img src="/img/menu.gif"></img>\
                        </a>\
                    </div>\
                </div>\
                <div class="dialog">\
                    <div class="content"></div>\
                    <div class="menu">\
                        <ul class="entity">关闭春菜</ul>\
                    </div>\
                </div>\
                <div class="bottom"></div>\
            </div>\
            <div class="shell"></div>\
        </div>\
        ';

        $("#right_list").append(ukagaka_html);
        Ukagaka.load_ghost()

        // var getwidth = this.tools.getCookie("historywidth");
        // var getheight = this.tools.getCookie("historyheight");
        // if (getwidth != null && getheight != null) {
        //     var width = getwidth;
        //     var height = getheight;
        // } else {
        //     var width = document.documentElement.clientWidth - 200 - this.data.imagewidth;
        //     var height = document.documentElement.clientHeight - 180 - this.data.imageheight;
        // }

        // var cwidth = document.documentElement.clientWidth - 100;
        // var cheight = document.documentElement.clientHeight - 20;
        // var moveX = 0;
        // var moveY = 0;
        // var moveTop = 0;
        // var moveLeft = 0;
        // var moveable = false;
        // var docMouseMoveEvent = document.onmousemove;
        // var docMouseUpEvent = document.onmouseup;

        // //$(".wcc.callchuncai").attr("style", "top:" + cheight + "px; left:" + cwidth + "px; text-align:center;");
        // $(".wcc.smchuncai").css('left', width + 'px')
        //     .css('top', height + 'px')
        //     .css('width', this.data.imagewidth + 'px')
        //     .css('height', this.data.imageheight + 'px')
        //     .ready(function() {
        //         Ukagaka.load_ghost();
        //     }).mousedown(function() {
        //         var ent = Ukagaka.tools.getEvent();
        //         moveable = true;
        //         moveX = ent.clientX;
        //         moveY = ent.clientY;
        //         obj = $(".wcc.smchuncai");

        //         moveTop = parseInt(obj.css('top'));
        //         moveLeft = parseInt(obj.css('left'));
        //         if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
        //             window.getSelection().removeAllRanges();
        //         }
        //         document.onmousemove = function() {
        //             if (moveable) {
        //                 var ent = Ukagaka.tools.getEvent();
        //                 var x = moveLeft + ent.clientX - moveX;
        //                 var y = moveTop + ent.clientY - moveY;
        //                 var w = 200;
        //                 var h = 200; //w,h为浮层宽高
        //                 obj.css('left', x + "px").css('top', y + "px");
        //             }
        //         };
        //         document.onmouseup = function() {
        //             if (moveable) {
        //                 var historywidth = obj.css('left');
        //                 var historyheight = obj.css('top');
        //                 historywidth = historywidth.replace('px', '');
        //                 historyheight = historyheight.replace('px', '');
        //                 Ukagaka.tools.setCookie("historywidth", historywidth, 60 * 60 * 24 * 30 * 1000);
        //                 Ukagaka.tools.setCookie("historyheight", historyheight, 60 * 60 * 24 * 30 * 1000);
        //                 document.onmousemove = docMouseMoveEvent;
        //                 document.onmouseup = docMouseUpEvent;
        //                 moveable = false;
        //                 moveX = 0;
        //                 moveY = 0;
        //                 moveTop = 0;
        //                 moveLeft = 0;
        //             }
        //         }
        //     });
    },



    // 设置表情
    setFace: function(num) {
        var src = $('.ukagaka_faces .temp_face' + num).attr('src');
        //showAlert("set face "+src)
        //$(".ukagaka .shell").attr("style", "background:url(" + obj + ") no-repeat scroll 50% 0% transparent; width:" + this.data.imagewidth + "px;height:" + this.data.imageheight + "px;");
        //$(".ukagaka .shell").css("background", "url(" + src + ");");
        $(".ukagaka .shell").attr("style", "background:url(" + src + ") no-repeat scroll 50% 0% transparent; width:" + this.data.imagewidth + "px;height:" + this.data.imageheight + "px;");

    },

    //春菜说话
    say: function(s) {
        this.clearSay();
        $(".ukagaka .bubble .dialog .content").text(s);
        $(".ukagaka .bubble .dialog .content").css("display", "block");
        //this.data.weichuncai_text = s;
        // var words = ""
        // for (var i = 0; i < s.length; i++) {
        //     words += words[i]
        //     setTimeout(function() { $('.ukagaka .bubble .dialog .content').text(words); }, 20)
        // }
    },

    //清空春菜说的话
    clearSay: function() {
        $(".ukagaka .bubble .dialog .content").text('');
    },

    //自言自语
    talkSelf: function() {
        this.data.talktime++;
        this.closeMenu();
        //this.closeNotice();

        //if (this.data.ghost['closeInput']) {
        //    this.data.ghost.closeInput();
        //}

        var random_index = Math.floor(Math.random() * this.data.talkself.length);
        this.say(this.data.talkself[random_index][0]);
        this.setFace(this.data.talkself[random_index][1]);
        this.data.talkself_obj = window.setTimeout("Ukagaka.talkSelf(" + this.data.talktime + ")", this.data.talkself_duration);
    },

    //停止自言自语
    stopTalkSelf: function() {
        if (this.data.talkself_obj) {
            clearTimeout(this.data.talkself_obj);
        }
    },

    //弹出春菜的菜单
    showMenu: function() {
        this.clearSay();

        // if (this.data.ghost['closeInput']) {
        //     this.data.ghost.closeInput();
        // }

        this.say("准备做什么呢？");
        $(".ukagaka .bubble .dialog .menu").css("display", "block");
        //$(".wcc .getmenu").css("display", "none");
        //$(".wcc .chuncaisaying").css("display", "none");
    },

    //关闭春菜的菜单
    closeMenu: function() {
        this.clearSay();
        $(".ukagaka .bubble .dialog .menu").css("display", "none");
        //$("#chuncaisaying").css("display", "block");
        //this.showNotice();
        //$(".wcc .getmenu").css("display", "block");
    },

    //显示提示信息
    // showNotice: function() {
    //     $(".wcc .chuncaisaying").css("display", "block");
    // },

    // 关闭提示信息
    // closeNotice: function() {
    //     $(".wcc .chuncaisaying").css("display", "none");
    // },





    //开启春菜
    show: function() {
        this.talkSelf();
        $(".ukagaka").fadeIn('normal');
        //$(".callchuncai").css("display", "none");
        this.closeMenu();
        //this.closeNotice();
        this.say("我回来啦～");
        //this.tools.setCookie("is_closechuncai", '', 60 * 60 * 24 * 30 * 1000);
    },

    //关闭春菜
    close: function() {
        this.stopTalkSelf();
        this.say("记得再叫我出来哦...");
        //$(".wcc .showchuncaimenu").css("display", "none");
        setTimeout(function() {
            $(".ukagaka").fadeOut(1000);
            //$(".callchuncai").css("display", "block");
        }, 1000);
        //保存关闭状态的春菜
        //this.tools.setCookie("is_closechuncai", 'close', 60 * 60 * 24 * 30 * 1000);
    },

    //关闭春菜，不预订
    // closechuncai_init: function() {
    //     this.stopTalkSelf();
    //     $(".ukagaka ").css("display", "none");
    //     setTimeout(function() {
    //         $(".ukagaka").css("display", "none");
    //     }, 30);
    // },



    // setTime: function() {
    //  this.data.tol++;
    //  //document.body.innerHTML(this.data.tol);
    //  this.data.timenum = window.setTimeout("Ukagaka.setTime('" + this.data.tol + "')", 1000);
    //  if (parseInt(this.data.tol) == parseInt(this.data.goal)) {
    //      this.stopTalkSelf();
    //      this.closeChuncaiMenu();
    //      this.closeNotice();

    //      if (this.data.this_ghost['closeInput']) {
    //          this.data.this_ghost.closeInput();
    //      }

    //      this.say("主人跑到哪里去了呢....");
    //      this.setFace(3);
    //      this.stoptime();
    //  }
    // },

    // stoptime: function() {
    //  if (this.data.timenum) {
    //      clearTimeout(this.data.timenum);
    //  }
    // },



    tools: {
        //随机排列自言自语内容
        arrayShuffle: function(arr) {
            var result = [],
                len = arr.length;
            while (len--) {
                result[result.length] = arr.splice(Math.floor(Math.random() * (len + 1)), 1);
            }
            return result;
        },

        //得到事件
        getEvent: function() {
            return window.event || arguments.callee.caller.arguments[0];
        },

        in_array: function(str, arr) {
            for (var i in arr) {
                if (arr[i] == str) {
                    return i;
                }
            }
            return false;
        },

        dateDiff: function(date1, date2) {
            var date3 = date2.getTime() - date1.getTime(); //时间差的毫秒数
            //计算出相差天数
            var days = Math.floor(date3 / (24 * 3600 * 1000));
            //注:Math.floor(float) 这个方法的用法是: 传递一个小数,返回一个最接近当前小数的整数,

            //计算出小时数
            var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
            var hours = Math.floor(leave1 / (3600 * 1000));
            //计算相差分钟数
            var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
            var minutes = Math.floor(leave2 / (60 * 1000));

            //计算相差秒数
            var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
            var seconds = Math.round(leave3 / 1000);

            var str = '';
            if (days > 0) str += ' <font color="red">' + days + "</font> 天";
            if (hours > 0) str += ' <font color="red">' + hours + "</font> 小时";
            if (minutes > 0) str += ' <font color="red">' + minutes + "</font> 分钟";
            if (seconds > 0) str += ' <font color="red">' + seconds + "</font> 分钟";
            return str;
        },

        //合并两个对象
        composition: function(target, source) {
            var desc = Object.getOwnPropertyDescriptor;
            var prop = Object.getOwnPropertyNames;
            var def_prop = Object.defineProperty;

            prop(source).forEach(function(key) {
                def_prop(target, key, desc(source, key))
            })
            return target;
        },

        getCookie: function(name) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (arr != null) return unescape(arr[2]);
            return null;
        },

        setCookie: function(name, val, ex) {
            var times = new Date();
            times.setTime(times.getTime() + ex);
            if (ex == 0) {
                document.cookie = name + "=" + val + ";";
            } else {
                document.cookie = name + "=" + val + "; expires=" + times.toGMTString();
            }
        }
    }
}
