var SERVER = "http://s1.navinda.xyz:3001";
var currentPage = "memeList";
var lastMemeId;
var loadMore = false;
var settings = {
    "theme": "light"
};
var likes = [];

ons.ready(init);

function init() {
    ons.disableDeviceBackButtonHandler();
    loadSettings();
    initOnsenSlideBar();
    initMemeListOnScroll();
    getMemes(null);
    loadLikes();
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

    toastToggle("Getting Memes....", null);
    request(path, "GET", {}).then(function (res) {
        if (res.length > 0) {
            if (lastMemeId !== 1) lastMemeId = res[res.length - 1].id;
        } else {
            lastMemeId = 1;
        }
        toastToggle(null, null);
        appendToMemeList(res);
    }).catch(function (err) {
        console.log(err);
        toastToggle(null, null);
    })
}


function appendToMemeList(memes) {
    for (var meme of memes) {
        var likeBtnAttr;
        if (checkLiked(meme.id)) {
            likeBtnAttr = `onclick="return false;" class="button"`;
        } else {
            likeBtnAttr = `onclick="likeMeme('${meme.id}', this)" class="button button--outline"`;
        }
        $("#memeList").append(
            `
            <ons-card>
            <img src="${SERVER}/meme/${meme.img}" style="width: 100%">
            <div class="content" style="margin-top:10px;">
                <button ${likeBtnAttr}>
                    <ons-icon icon="md-thumb-up"></ons-icon>
                    <span>${meme.likes}</span>
                </button>

                <span style="float: right">
                    <button onclick="downloadMeme('${SERVER}/meme/${meme.img}')" class="button button--outline">
                        <ons-icon icon="md-cloud-download"></ons-icon> 
                    </button>              
                    <button onclick="viewMeme('${SERVER}/meme/${meme.img}')" class="button button--outline">
                        <ons-icon icon="md-open-in-new"></ons-icon> 
                    </button>
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

function likeMeme(id, event) {
    if (!checkLiked(id)) {
        request("/like/" + id, "PUT", {}).then(function (res) {
            toastToggle("Meme Liked!", 500);
            saveLike(id, event, res);
        }).catch(function (err) {
            console.log(err);
        });
    }
}

function saveLike(id, event, res) {
    if (!checkLiked(id)) {
        $(event).attr("class", "button");
        $(event).children("span").text(res.likes);
        likes.push(id);
        localStorage.setItem("likes", JSON.stringify(likes));
    }
}

function loadLikes() {
    if (localStorage.getItem("likes")) {
        likes = JSON.parse(localStorage.getItem("likes"));
    }
}

function checkLiked(id) {
    return likes.indexOf(id.toString()) > -1
}

function reportMeme(id) {
    toastToggle("Meme Reported!", 500);
}

function viewMeme(url) {
    window.open(url, "_blank");
}

function downloadMeme(url) {
    var fail = function () {
        toastToggle("Sorry!. I was unable to download that meme.", 1500);
    }
    var success = function (data) {
        toastToggle("Meme Downloaded!", 1500);
    }
    cordova.plugins.DownloadManager.download(url, success, fail);
}

function request(path = "", method, data) {
    loadMore = false;
    var API = SERVER + "/api";

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
        });
    });
}

function isNullOrEmpty(input) {
    return jQuery.isEmptyObject(input);
}
