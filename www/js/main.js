var SERVER = "http://s1.navinda.xyz:3001";
var currentPage = "memeList";
var lastMemeId;
var loadMore = false;
var settings = {
    "theme": "light"
};

ons.ready(init);

function init() {
    ons.disableDeviceBackButtonHandler();
    loadSettings();
    initOnsenSlideBar();
    initMemeListOnScroll();
    getMemes(null);
}

function getMemes(id) {
    currentPage = "memeList";
    var path;

    if (id !== null) {
        path = "/memes/" + id;
    } else {
        path = "/memes";
        $("#memeList").empty();
    }

    request(path, "GET", {}).then(function (res) {
        if (res.length > 0) {
            if (lastMemeId !== 1) lastMemeId = res[res.length - 1].id;
        } else {
            lastMemeId = 1;
        }
        appendToMemeList(res);
    }).catch(function (err) {
        console.log(err);
    })
}


function appendToMemeList(memes) {
    for (var meme of memes) {
        $("#memeList").append(
            `
            <ons-card>
            <img src="${SERVER}/meme/${meme.img}" style="width: 100%">
            <div class="content" style="margin-top:10px;">
                <button onclick="likeMeme('${meme.id}')" class="button button--outline">
                    <ons-icon icon="md-thumb-up"></ons-icon>
                    Like
                </button>
                <button onclick="viewMeme('${SERVER}/meme/${meme.img}')" class="button button--outline">
                    <ons-icon icon="md-open-in-new"></ons-icon> View
                </button>
                <span style="float: right">
                    <button onclick="reportMeme('${meme.id}')" class="button button--outline">
                        <ons-icon icon="md-alert-circle-o"></ons-icon>
                    </button>
                </span>
            </div>
        </ons-card>
            `
        );
    }
}

function switchTheme() {
    if (settings.theme == "dark") {
        setSetting("theme", "light");
    } else {
        setSetting("theme", "dark");
    }
}

function refresh() {
    getMemes(null);
}

function initMemeListOnScroll() {
    $('.page__content').on('scroll', function () {
        var isBottom = ($(this).scrollTop() + $(this).innerHeight() + 100 >= $(this)[0].scrollHeight);
        if (isBottom && currentPage == "memeList" && loadMore && lastMemeId !== 1) {
            getMemes(lastMemeId);
        }
    });
}

function getBestMemes() {
    currentPage = "bestMemeList";
    $("#memeList").empty();
    menu.close();
    request("/best", "GET", {}).then(function (res) {
        appendToMemeList(res);
    }).catch(function (err) {
        console.log(err);
    })
}

function likeMeme(id) {
    request("/like/" + id, "PUT", {}).then(function (res) {
        toastToggle("Meme Liked!", 500);
    }).catch(function (err) {
        console.log(err);
    })
}

function reportMeme(id) {
    toastToggle("Meme Reported!", 500);
}

function viewMeme(url) {
    window.open(url, "_blank");
}

function request(path = "", method, data) {
    loadMore = false;
    var API = SERVER + "/api";
    toastToggle("Getting Memes....", null);

    return new Promise((resolve, reject) => {
        let settings = {
            url: API + path,
            method: method,
            data: data,
            dataType: "json"
        };

        $.ajax(settings).done(function (res) {
            if (res.error) {
                reject(res);
            } else {
                resolve(res);
            }
            loadMore = true;
            toastToggle(null, null);
        });
    });
}

function isNullOrEmpty(input) {
    return jQuery.isEmptyObject(input);
}
