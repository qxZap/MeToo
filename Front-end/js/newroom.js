document.getElementById('roomname').value = "";
document.getElementById('description').value = "";
document.getElementById('location').value = "";
document.getElementById('size').value = "";
document.getElementById('tags').value = "";

document.getElementById('newRoomForm').addEventListener('keypress', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });

$("#newRoomForm").submit(function(e) {
    e.preventDefault();
});

function setPositions(position){
		localStorage.setItem("userLat",position.coords.latitude);
    	localStorage.setItem("userLon",position.coords.longitude);
}


function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(setPositions);
    }
    else{
      alert("Your browser does not support location");
    }
    return localStorage.getItem("userLat")+" "+localStorage.getItem("userLon");
}

function newRoom(){
	var roomname = document.getElementById('roomname').value;
	var description = document.getElementById('description').value;
	var location = document.getElementById('location').value;
	var size = document.getElementById('size').value;
	var tags = document.getElementById('tags').value;
	var accessToken = localStorage.getItem("MeTooAccessToken");
	

	if(roomname!=""&&size!=""){
		if(location===""){
			location=getLocation();
		}
		var xhr = new XMLHttpRequest();
		var url = "http://127.0.0.1:8090/new_room";
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
		    if (xhr.readyState === 4 && xhr.status === 200) {
		        var json = JSON.parse(xhr.responseText);
		        var toAdd = {"roomname":roomname,"location":location,"owner":json['username'],"lobby":[json['username']],"size":size};	
				localStorage.setItem("toAdd",JSON.stringify(toAdd));
		        window.location.replace('Dashboard.html');
		    }
		};
		var data = JSON.stringify({"roomName": roomname, "lobbySize": size,"description": description,"location":location,"tags":tags,"accessToken":accessToken});
		xhr.send(data);
	}
}