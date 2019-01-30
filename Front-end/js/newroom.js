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
	var title = document.getElementById('title').value;
	var link = document.getElementById('link').value;
	var accessToken = localStorage.getItem("MeTooAccessToken");
	

	if(roomname!=""){
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
		        var toAdd = {
		        	"roomname":roomname,
		        	"location":location,
		        	"owner":json['username'],
		        	"lobby":[json['username']],
		        	"size":size,
		        	"title":title,
		        	"link":link
		        };	
		        window.location.replace('Dashboard.html');
		    }
		};
		if(size===""){
			size=5;
		}
		var data = JSON.stringify({
			"roomName": roomname, 
			"lobbySize": size,
			"description": description,
			"location":location,
			"tags":tags,
			"accessToken":accessToken,
			"title":title,
			"link":link
		});
		xhr.send(data);
	}
}


window.setInterval(function checkNewRoomFields(){
	var roomNameLabel = document.getElementById('roomnameLabel');
	var roomName = document.getElementById('roomname').value;
	if(roomName===""){
		roomNameLabel.innerHTML = 'Name:<font color="red">*</font>';
	}
	else{
		roomNameLabel.innerHTML = 'Name:';
	}

	var descriptionLabel = document.getElementById('descriptionLabel');
	var description = document.getElementById('description').value;
	if(description===""){
		descriptionLabel.innerHTML = 'Description:<font color="red">*</font>';
	}
	else{
		descriptionLabel.innerHTML = 'Description:';
	}

	var titleLabel = document.getElementById('titleLabel');
	var title = document.getElementById('title').value;
	if(title===""){
		titleLabel.innerHTML = 'Title:<font color="red">*</font>';
	}
	else{
		titleLabel.innerHTML = 'Title:';
	}

}, 2000);



var map;
var marker = false; 
        

function initMap() {
 
    
    var centerOfMap = new google.maps.LatLng(47.1463669,27.5892513);
 
    
    var options = {
      center: centerOfMap, 
      zoom: 15 
    };
 
    map = new google.maps.Map(document.getElementById('map'), options);
 
    google.maps.event.addListener(map, 'click', function(event) {    
        var clickedLocation = event.latLng;
        if(marker === false){
            marker = new google.maps.Marker({
                position: clickedLocation,
                map: map,
                draggable: true 
            });
	            google.maps.event.addListener(marker, 'dragend', function(event){
	                markerLocation();
            });
        } 
        else{
            
            marker.setPosition(clickedLocation);
        }
        markerLocation();
    });
}

function markerLocation(){
    var currentLocation = marker.getPosition();
    document.getElementById('location').value = ""+currentLocation.lat()+" "+currentLocation.lng()+"";
}
        

