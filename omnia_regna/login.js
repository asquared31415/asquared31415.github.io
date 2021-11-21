var ws;
var data = {profile:null, inventory:null};
var out;
var chat;
var itemInfo;

document.addEventListener('DOMContentLoaded', (e) => {
    out = document.getElementById("output");
    itemInfo = document.getElementById("itemInfo");
    chat = document.getElementById("chatBox");
    document.getElementsByTagName("body")[0].addEventListener('click', event=>{
        if (!(event.path[2].id === "inventory")){
            itemInfo.classList.remove("activeList");
        }
    });
});

function httpGet(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.callback = callback;
    xmlHttp.onload = function (e) {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
                console.log(xmlHttp.responseText);
                callback.apply(xmlHttp, [0, JSON.parse(xmlHttp.responseText).Servers])
            } else {
                console.error(xmlHttp.statusText);
            }
        }
    };
    xmlHttp.onerror = function (e) {
        console.error(xmlHttp.statusText);
    };
    xmlHttp.open( "GET", theUrl);
    xmlHttp.send( null );
}

function SubmitCreds(){
    // Yay CORS
    // Get the valid configurations and try to open a connection with them
    httpGet("https://cors-anywhere.herokuapp.com/https://omniaregna.com/client_config.json", tryOpenSocket);
}

function tryOpenSocket(index, hostList){
    ws = new WebSocket("wss://" + hostList[index].Host + ":" + hostList[index].Port);
    ws.onopen = wsOnOpen;
    ws.onmessage = wsRecieveMessage;
    ws.onerror = function(e){
        console.warn("Connection to WebSocket " + ws.url + "failed.");
        if(index < hostList.length - 1) {
            console.warn("Trying again on host " + hostList[index + 1] + " port " + hostList[index + 1]);
            tryOpenSocket(index + 1, hostList);
        }
    }
}

function wsOnOpen(){
    var u = document.getElementById("username").value;
    var p = document.getElementById("password").value;
    var data = {"type":"LogIn","nameOrAddress": u,"password": p, "persist": false};
    ws.send(JSON.stringify(data));
}

function wsRecieveMessage(event){
    var json = JSON.parse(event.data);
    console.log(json.type);
    switch (json.type){
        case "LoginStatus":
            var status = document.getElementById("status");
            if (status){
                status.parentNode.innerHTML = "Output:<br>";
            }
            if (json.status == undefined || json.status != "LoggedIn"){
                console.log("failed to log in");
                out.innerHTML += "<span id=\"status\" style=\"color: red\">Failed to log in.</span><br>"
                return;
            }
            console.log("auth sucessful");
            out.innerHTML += "<span id=\"status\" style=\"color: green\">Authenticated with server.</span><br>"
            ws.send(JSON.stringify({type:"FetchProfile"}));
            break;
        case "Profile":
            data.profile = json;
            displayData();
            break;
        case "Inventory":
            data.inventory = json.inventory;
            break;
        case "Chat":
            console.Log(json);
            chat.innerHTML += "<p class=\chatMessage\">" + json.line + "</p>";
            break;
        default:
            console.log("another message was recieved with type", json.type);
            break;
    }
}

function displayData(){
    out.innerHTML += "<div id=\"invOut\"></div>";
    var invOut = document.getElementById("invOut");

    // Profile data
    var profile = data.profile;
    console.log("profile data: id " + profile.id + " username " + profile.username);
    invOut.innerHTML += "<span>Profile data recieved, logged in as user ID #" + profile.id + ", username " + profile.username + "</span><br>";
    var avatar = profile.avatar;
    console.log("avatar " + avatar);
    invOut.innerHTML += "<div><span>Current avatar: </span><div class=\"avatar-display\" style=\"background-position-x:" + -32 * (avatar - 1) + "px\"</div></div>";
    
    // Inventory Data
    console.log(data.inventory);
    invOut.innerHTML += "<p>Current Inventory:</p><div id=\"inventory\"></div>";
    var inv = document.getElementById("inventory");
    data.inventory.forEach(element => {
        if (element && element.tile){
            var count = element.q >= 2 ? "<div class=\"itemCount\">" + element.q + "</div>" : "";
            inv.innerHTML += "<div class=\"inventoryItem\"><div class=\"icon\" style=\"background-position-x:" + -32 * (element.tile - 1) + "px\">" + count + 
                                "</div><p class=\"itemName\">" + element.n + "</p></div>";
        }else{
            inv.innerHTML += "<div class=\"inventoryItem\"><div class=\"noItem\"></div><p class=\"itemName\">None</p></div>";
        }
    });
    var invItems = document.getElementsByClassName("inventoryItem");
    for (let element of invItems){
        element.addEventListener('click', event =>{
            var nodes = Array.prototype.slice.call(invItems);
            var i = nodes.indexOf(element);
            showItemOptions(data.inventory[i]);
        });
    }
}

function showItemOptions(item) {
    var name = (item && item.n) ? item.n : "None";
    var quantity = (item && item.q) ? item.q + "/" + (item.mq ? item.mq : "-") : "-";
    itemInfo.classList.add("activeList");
    itemInfo.children[0].children[1].innerHTML = name;
    itemInfo.children[1].children[1].innerHTML = quantity;
    // TODO: Add weapon data?
}