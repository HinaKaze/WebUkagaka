$(document).ready(function() {
    $("#show_ukagaka").click(function() {
        if ($(this).text() == "隐藏春菜") {
            Ukagaka.shell.setFace(3);
            Ukagaka.close()
            $(this).text("显示春菜")
        } else {
            Ukagaka.shell.setFace(2);
            Ukagaka.show();
            $(this).text("隐藏春菜")
                //Ukagaka.tools.setCookie("is_closechuncai", '', 60 * 60 * 24 * 30 * 1000);
        }
    })
})

/**
 * Main Function:
 * 1.talkself
 * 2.load faces
 * 3.load menu
 * @type {Object}
 */
var Ukagaka = {

    data: {
        site_path: "not init", //基础路径
        vghost_name: "not init",
        shell_path: "not init",
        ghost_script_path: "not init",
    },

    ghost: {},
    shell: {
        data: {
            //talkself config
            talkself_duration: 5000, //设置自言自语频率（单位：秒）
            talkself_timeout: {}, //存储talkself的setTimeout返回值，方便删除这个timeout
            talkself: [
                ["白日依山尽，黄河入海流，欲穷千里目，更上.....一层楼？", "1"],
                ["我看见主人熊猫眼又加重了！", "3"],
                ["我是不是很厉害呀～～？", "2"],
                ["5555...昨天有个小孩子跟我抢棒棒糖吃.....", "3"],
                ["昨天我好像看见主人又在众人之前卖萌了哦～", "2"],
                ["你喜欢我吗？快来陪我一起玩吧。", "2"],
                ["喔耶～加油！加油！加油！加油！", "2"],
                ["有发现春菜有什么bug，请大家回馈呀。", "3"],
                ["主人现在老是弃旧迎新，朋友们都好伤心啊..", "3"],
                ["哇啊啊啊啊啊啊啊啊啊...", "3"],
            ], //[talkself_content,face_index]
            face_length: 0,
            width: 0, //伪春菜的大小
            height: 0, //伪春菜的大小
        },
        // 设置表情
        setFace: function(num) {
            if (num != 1 && this.data.face_length < num) {
                this.say("人家没有这么多表情啦")
                return
            }
            var src = $('.ukagaka_faces .face' + num).attr('src');
            $(".ukagaka .shell").attr("style", "background:url(" + src + ") no-repeat scroll 50% 0% transparent; width:" + this.data.width + "px;height:" + this.data.height + "px;");

        },

        //春菜说话
        say: function(s) {
            this.clearSay();
            $(".ukagaka .bubble .dialog .content").text(s);
            $(".ukagaka .bubble .dialog .content").css("display", "block");
        },

        //清空春菜说的话
        clearSay: function() {
            $(".ukagaka .bubble .dialog .content").text('');
        },

        //自言自语
        talkSelf: function() {
            this.closeMenu();
            var random_index = Math.floor(Math.random() * this.data.talkself.length);
            this.say(this.data.talkself[random_index][0]);
            this.setFace(this.data.talkself[random_index][1]);
            this.data.talkself_timeout = window.setTimeout("Ukagaka.shell.talkSelf()", this.data.talkself_duration);
        },

        //停止自言自语
        stopTalkSelf: function() {
            if (this.data.talkself_timeout) {
                clearTimeout(this.data.talkself_timeout);
            }
        },

        //弹出春菜的菜单
        showMenu: function() {
            this.clearSay();
            this.say("准备做什么呢？");
            $(".ukagaka .bubble .dialog .menu").css("display", "block");
        },

        //关闭春菜的菜单
        closeMenu: function() {
            this.clearSay();
            $(".ukagaka .bubble .dialog .menu").css("display", "none");
        },
    },

    /**
     * 
     * @param  {[type]} 
     * data {
     *      site_path:"",
     *      shell_width:0,
     *      shell_height:0,
     *      ghost_name:"",
     *      append_obj:{}
     * }
     * @return {[type]}      [description]
     */
    init: function(data) {
        this.data.site_path = data.site_path
        this.data.ghost_name = data.ghost_name
        this.data.shell_path = data.site_path + "shell/" + data.ghost_name + "/"
        this.data.ghost_script_path = data.site_path + "ghost/" + data.ghost_name + ".js"
        this.shell.data.width = data.shell_width
        this.shell.data.height = data.shell_height


        var ukagaka_html = '\
        <div class="ukagaka" onfocus="this.blur();" style="color:#626262;z-index:999;">\
            <div class="bubble">\
                <div class="top">\
                    <div class="tools">\
                        <a href="javascript:void(0);" id="ukagaka_menu">\
                            <img src=""></img>\
                        </a>\
                    </div>\
                </div>\
                <div class="dialog">\
                    <div class="content"></div>\
                    <div class="menu">\
                        <ul class="entity" id="back">返回</ul>\
                    </div>\
                </div>\
                <div class="bottom"></div>\
            </div>\
            <div class="shell"></div>\
        </div>\
        ';
        $("body").append(ukagaka_html);
        $("#ukagaka_menu img").attr("src", this.data.shell_path + "menu.gif")
        $(".ukagaka .shell").css("width", this.shell.width).css("height", this.shell.height)
        $(".ukagaka .bubble .top").css("background-image","url("+this.data.shell_path+"bubble_top.gif)")
        $(".ukagaka .bubble .dialog").css("background-image","url("+this.data.shell_path+"bubble_dialog.gif)")
        $(".ukagaka .bubble .bottom").css("background-image","url("+this.data.shell_path+"bubble_bottom.gif)")

        Ukagaka.loadGhost()
    },

    //加载ghost
    loadGhost: function() {
        var shell = this.shell
        $.getScript(this.data.ghost_script_path).done(function() {
            if (ghost && ghost.data.faces) {
                //init ghost
                ghost.init(shell);
                //load ghost faces
                Ukagaka.loadGhostFaces(ghost.data.faces);
                //load ghost menu
                Ukagaka.loadGhostMenu(ghost.data.menu);
                Ukagaka.data.ghost = ghost;
                //init show
                ghost.shell.talkSelf();
                ghost.shell.setFace(1);
                return true;
            } else {
                shell.say("伪春菜[ghost:" + Ukagaka.data.ghost_name + "]初始化失败!请确保ghost中至少有一个表情");
                return false;
            }
        }).fail(function(jqxhr, settings, exception) {
            shell.say("伪春菜[ghost:" + Ukagaka.data.ghost_name + "]获得script失败！请检查script地址是否正确");
            return false;
        });
    },

    //加载ghost表情
    loadGhostFaces: function(faces) {
        var html = '<div class="ukagaka_faces">';
        for (var i in faces) {
            html += '<img class="face' + i + '" src="' + this.data.shell_path + faces[i] + '" />';
            this.shell.data.face_length++
        }
        html += '</div>';

        $("head").append(html);
    },

    //加载ghost菜单
    loadGhostMenu: function(menu) {
        var menu_html = "";
        for (var i = menu.length - 1; i >= 0; i--) {
            menu_html += '<ul class="entity" id="' + menu[i][0] + '">' + menu[i][1] + '</ul>';
        };
        $(".ukagaka .bubble .dialog .menu").prepend(menu_html);

        $("#ukagaka_menu").click(function() {
            Ukagaka.shell.showMenu();
            Ukagaka.shell.setFace(1);
            Ukagaka.shell.stopTalkSelf();
        });

        $('.ukagaka .bubble .dialog .menu .entity').click(function() {
            if (this.id == "back") {
                Ukagaka.shell.closeMenu()
                Ukagaka.shell.talkSelf()
            } else {
                if (Ukagaka.data.ghost[this.id]) {
                    Ukagaka.data.ghost[this.id]();
                    return;
                } else {
                    Ukagaka.shell.say("这是什么啊？快教教我嘛！");
                }
            }
        });
    },

    //开启春菜
    show: function() {
        this.shell.talkSelf();
        $(".ukagaka").fadeIn('normal');
        //$(".callchuncai").css("display", "none");
        this.shell.closeMenu();
        //this.closeNotice();
        this.shell.say("我回来啦～");
        //this.tools.setCookie("is_closechuncai", '', 60 * 60 * 24 * 30 * 1000);
    },

    //关闭春菜
    close: function() {
        this.shell.stopTalkSelf();
        this.shell.say("记得再叫我出来哦...");
        //$(".wcc .showchuncaimenu").css("display", "none");
        setTimeout(function() {
            $(".ukagaka").fadeOut(1000);
            //$(".callchuncai").css("display", "block");
        }, 1000);
        //保存关闭状态的春菜
        //this.tools.setCookie("is_closechuncai", 'close', 60 * 60 * 24 * 30 * 1000);
    },

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
