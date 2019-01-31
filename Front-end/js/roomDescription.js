var roomOwner = "";
var cased = 1;
var inRoom = false;
var isOwner = false;
var roomToLoad = localStorage.getItem("roomToLoad");
function action(){
	if(isOwner){
			var xhr = new XMLHttpRequest();
			var url = "http://127.0.0.1:8090/rooms/delete/"+localStorage.getItem("roomToLoad")+"/"+localStorage.getItem("MeTooAccessToken");
			xhr.open("DELETE", url, true);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.onreadystatechange = function () {
			    if (xhr.readyState === 4 && xhr.status === 200) {
			        
			        	var roomToLoad = localStorage.setItem("roomToLoad","");
              			window.location.replace('Dashboard.html');
			        
			    }
			    if (xhr.status === 404){
			    	var json = JSON.parse(xhr.responseText);
			    	if(!json['status']){
			    		alert("Room not found");
			    		location.reload();
			    	}
			    }
			};
			xhr.send(null);	
	}
	else{
		if(inRoom){
			var xhr = new XMLHttpRequest();
			var url = "http://127.0.0.1:8090/rooms/leave";
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.onreadystatechange = function () {
			    if (xhr.readyState === 4 && xhr.status === 200) {
			        var json = JSON.parse(xhr.responseText);
			        if(json['status']===true){
			        	location.reload();
			        }
			        else{
			        	console.log("some issue");
			        }
			        console.log(json);
			    }
			    if (xhr.status === 401){
			    	var json = JSON.parse(xhr.responseText);
			    	if(!json['status']){
			    		alert("You are not in the room");
			    		location.reload();
			    	}
			    }
			};
			var data = JSON.stringify({
				"roomID": localStorage.getItem("roomToLoad"), 
				"accessToken": localStorage.getItem("MeTooAccessToken")
			});
			xhr.send(data);	


		}
		else{
			var xhr = new XMLHttpRequest();
			var url = "http://127.0.0.1:8090/rooms/join";
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.onreadystatechange = function () {
			    if (xhr.readyState === 4 && xhr.status === 200) {
			        var json = JSON.parse(xhr.responseText);
			        if(json['status']===true){
			        	location.reload();
			        }
			        else{
			        	console.log("some issue");
			        }
			        console.log(json);
			    }
			    if (xhr.status === 409){
			    	var json = JSON.parse(xhr.responseText);
			    	if(json['status']){
			    		alert("Room full already");
			    		location.reload();
			    	}
			    	else{
			    		alert("You are already in the room");
			    	}
			    }
			};
			var data = JSON.stringify({
				"roomID": localStorage.getItem("roomToLoad"), 
				"accessToken": localStorage.getItem("MeTooAccessToken")
			});
			xhr.send(data);

	
		}
	}

}







localStorage.setItem("lobbyImages","");


function loadPics(){
	document.getElementById('lobby').innerHTML+=localStorage.getItem("lobbyImages");
}


var xhr = new XMLHttpRequest();
      var url = "http://127.0.0.1:8090/rooms/get/"+roomToLoad+"/"+localStorage.getItem("MeTooAccessToken");
      xhr.open("GET", url, false);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
              var json = JSON.parse(xhr.responseText)['room'];
              document.getElementById('description').innerHTML=json['description'];
              document.getElementById('roomName').innerHTML=json['roomName'];
              roomOwner = json['owner'];
              if(roomOwner===localStorage.getItem("username")){
					isOwner = true;
				}
			  if(json['lobby'].includes(localStorage.getItem("username"))){
			  	inRoom = true;
			  }
              coordinates = {lat: parseFloat(json['location'].split(' ')[0]), lng: parseFloat(json['location'].split(' ')[1])};
             	
              initMap(newInit=true);
              var sizeText = json['lobby'].length+"/"+json['lobbySize'];
              if(json['lobby'].length===json['lobbySize']){

				document.getElementById('actionButton').innerHTML="Full";	
              }
              var link = "";
              if(json['link']===""){
              	link="http://maps.google.com/?ie=UTF8&hq=&ll="+json['location'].split(' ').toString()+"&z=18";
              }
              document.getElementById('lobby').innerHTML=`<p class="altaDescriere" style="padding-left: 2%">Link: </p>
                    <a class="altaDescriere" href="`+link+`" style="padding-top: 2.5%;">`+json['title']+`</a>`;  
              document.getElementById('lobby').innerHTML+=`<p id="lobby_size" class="altaDescriere">Lobby: `+sizeText+`</p>`;
              json['lobby'].forEach(function(user){
              	var xhr = new XMLHttpRequest();
		    	 var url = "http://127.0.0.1:8090/profile/picture/"+user;
		    	 xhr.open("GET", url, false);
		    	 xhr.onreadystatechange = function () {
		    	 	if (xhr.readyState === 4 && xhr.status === 200) {
		    	 		image = JSON.parse(xhr.responseText)['url'];
		    	 		document.getElementById('lobby').innerHTML+= `<img class="photo" src="`+image+`" alt="SmileyFace">`;
		    	 		localStorage.setItem("lobbyImages",localStorage.getItem("lobbyImages")+`<img class="photo" src="`+image+`" alt="SmileyFace">`);
		    	 		console.log(image);
		    	 		
		    	 	}

		    	 }
		    	 xhr.send(null);
		    
              });
             
          }
      };    
xhr.send(null);

if(isOwner){
		document.getElementById('actionButton').innerHTML="Delete";	
	}
	else{
		if(inRoom){
			document.getElementById('actionButton').innerHTML="Leave";	
		}
		else{
			document.getElementById('actionButton').innerHTML="Join";	
		}
	}


function initMap(newInit=false) {
				var myLatLng = {lat: 47.164352799999996, lng: 27.599058399999997};
				if(newInit)
                	var myLatLng = coordinates;

                var map = new google.maps.Map(document.getElementById('map'), {
                  zoom: 17,
                  center: myLatLng
                });

                var marker = new google.maps.Marker({
                  position: myLatLng,
                  map: map,
                  title: 'Hello World!'
                });
}




