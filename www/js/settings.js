function loadSettings() {
    if (localStorage.getItem("settings")) {
        settings = JSON.parse(localStorage.getItem("settings"));
        applySettings();
    }
}

function applySettings() {
    if (settings.theme == "dark") {
        $("#theme").attr("href", "./lib/css/dark-onsen-css-components.min.css");
    } else {
        $("#theme").attr("href", "./lib/css/onsen-css-components.min.css");
    }
}

function setSetting(setting, value) {
    settings[setting] = value;
    localStorage.setItem("settings", JSON.stringify(settings));
    applySettings();
}