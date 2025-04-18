var SERVER = "https://08f935720c3d5ed1621a588fe31ac177.fossnoob.xyz";
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
            <img id="${meme.hash}" src="./img/loading.gif" style="width: 100%">
            ${getSource(meme.source)}
            <div class="content" style="margin-top:10px;">
                <button ${likeBtnAttr}>
                    <ons-icon icon="md-thumb-up"></ons-icon>
                    <span>${meme.likes}</span>
                </button>

                <span style="float: right">            
                    <button onclick="viewMeme('${meme.img}')" class="button button--outline">
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

        loadMeme(meme.hash, `${meme.img}`);
    }

    loadSettings();
}

function loadMeme(id, img) {
    var tmpImg = new Image();
    var memeImg = $("#" + id);
    var imageLoaded = function () {
        $(memeImg).attr("src", img);
    };
    var imageNotLoaded = function () {
        $(memeImg).attr("src", "./img/404.png");
    };
    tmpImg.onload = imageLoaded;
    tmpImg.onerror = imageNotLoaded;
    tmpImg.src = img;
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
    toastToggle("Getting Memes....", null);
    request("/best", "GET", {}).then(function (res) {
        appendToMemeList(res);
        toastToggle(null, null);
    }).catch(function (err) {
        console.log(err);
        toastToggle(null, null);
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
    window.open(url, "_blank");
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

function getSource(url) {
    try {
        const urlParts = url.split("/");
        const source = urlParts[3];
        return `
            By <a class="memeSource" href="${url}"><b>${source}</b></a>
        `
    } catch {
        return "By Unknown"
    }
}

function isNullOrEmpty(input) {
    return jQuery.isEmptyObject(input);
}
