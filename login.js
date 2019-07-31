var ws;
var data = {profile:null, inventory:null};
var out;

function SubmitCreds(){
    out = document.getElementById("output");
    ws = new WebSocket("wss://servers.omniaregna.com:" + document.getElementById("port").value);
    ws.onopen = wsOnOpen;
    ws.onmessage = wsRecieveMessage;
    ws.onerror = function(e){
        document.getElementById("port").style = "background-color: red";
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
    switch (json.type){
        case "LoginStatus":
            var status = document.getElementById("status");
            if (status != null){
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
            inv.innerHTML += "<div class=\"inventoryItem\" style=\"background-position-x:" + -32 * (element.tile - 1) + "px\">" + count + 
                                "<p class=\"itemName\">" + element.n + "</p></div>";
        }else{
            inv.innerHTML += "<div class=\"inventoryItem noItem\"><p class=\"itemName\">None</p></div>";
        }
    });
}