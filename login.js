var ws;

function SubmitCreds(){
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
    var data = {"type":"LogIn","nameOrAddress": u,"password": p};
    ws.send(JSON.stringify(data));
}

function wsRecieveMessage(event){
    var out = document.getElementById("output");
    var json = JSON.parse(event.data);
    switch (json.type){
        case "LoginStatus":
            if (json.status == undefined || json.status != "LoggedIn"){
                console.log("failed to log in");
                out.innerHTML += "<span style=\"color: red\">Failed to log in.</span><br>"
                return;
            }
            console.log("auth sucessful");
            out.innerHTML += "<span style=\"color: green\">Authenticated with server.</span><br>"
            ws.send(JSON.stringify({type:"FetchProfile"}));
            break;
        case "Profile":
            console.log("profile data: id " + json.id + " username " + json.username);
            out.innerHTML += "<span>Profile data recieved, logged in as user ID #" + json.id + ", username " + json.username + "</span><br>"
            var avatar = json.avatar
            console.log("avatar " + avatar);
            out.innerHTML += "<div><span>Current avatar: </span><div class=\"avatar-display\" style=\"background-position-x:" + -32 * (avatar - 1) + "px\"</div></div>";
            console.log(json)
            break;
        case "Inventory":
            console.log("Recieved Inventory data", json.inventory);
            break;
        default:
            console.log("another message was recieved with type", json.type);
            break;
    }
}