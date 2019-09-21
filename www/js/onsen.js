// set onisen slider
var menu = document.getElementById("menu");
function initOnsenSlideBar() {
    window.fn = {};
    window.fn.open = function () {
        menu.open();
    };
    window.fn.load = function (page) {
        var content = document.getElementById("content");
        var menu = document.getElementById("menu");
        content.load(page).then(menu.close.bind(menu));
    };
    // disable post auto load when menu is open
    menu.addEventListener("postopen", function () {
        loadMore = false;
    });

    menu.addEventListener("postclose", function () {
        loadMore = true;
    });
}

function toastToggle(msg, time) {
    var toast = $("#outputToast");
    var toastMsg = $("#outputToastMsg");

    if (isNullOrEmpty(msg) && isNullOrEmpty(time)) {
        toast.hide();
    } else if (!isNullOrEmpty(msg) && time !== null) {
        ons.notification.toast(msg, { timeout: time, animation: "ascend" });
    } else {
        toastMsg.text(msg);
        toast.show();
    }
}