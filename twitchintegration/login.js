var params = {};

document.addEventListener("DOMContentLoaded", (_) => {
    const hash = document.location.hash.slice(1);
    const split = hash.split("&");

    for (const paramKey in split) {
        if (Object.hasOwnProperty.call(split, paramKey)) {
            const param = split[paramKey];
            const parts = param.split("=");
            if (parts[0] != undefined && parts[1] != undefined) {
                params[parts[0]] = parts[1];
            }
        }
    }

    const origin = window.location.origin;
    const path = window.location.pathname;
    history.replaceState(null, "Twitch Integration Login", origin + path);
});

function reveal() {
    const element = document.getElementById("token");
    if (Object.hasOwn(params, "access_token")) {
        element.innerHTML = "oauth:" + params["access_token"];
    } else {
        console.warn("No access token returned!");
        element.innerHTML = "ERROR: No access token!";
    }
}
