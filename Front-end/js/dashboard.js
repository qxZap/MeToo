

var userLat = null;
var userLon = null;
var nowtf="";


var searchBar = document.getElementById("search");
searchBar.addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
      var tagsToSearch = searchBar.value.split(' ');
      var range = 50.2;
      var xhr = new XMLHttpRequest();
      var url = "http://127.0.0.1:8090/rooms/search/"+range+"/"+localStorage.getItem("userLat")+"/"+localStorage.getItem("userLon");
      
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
              var json = JSON.parse(xhr.responseText);
              localStorage.setItem("MeTooRooms",JSON.stringify(json));
              focusTab('browseTab');
              listRooms();
          }
      };    
      var data = JSON.stringify({
        "accessToken": localStorage.getItem("MeTooAccessToken"), 
        "tags":tagsToSearch
      });
      xhr.send(data);

  }
});


function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function getFromLocal(who){
  var intro = localStorage.getItem(who);
    var obj = null;
    if(intro!=null)
      obj = JSON.parse(intro);
    else
      obj = new Object();
  return obj;
}


function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return earthRadiusKm * c;
}


function clearRooms(){
    document.getElementById('listedRooms').innerHTML=`
    <tr>
            <th>Project Name</th>
            <th>Location</th>
            <th>Room ocupation</th>
            <th>Owner</th>
          </tr>
    `;
}

function resetTabs(){
  document.getElementById('browseTab').classList.remove("active");
  document.getElementById('localTab').classList.remove("active");
  document.getElementById('yourRoomsTab').classList.remove("active");
  document.getElementById('newRoomTab').classList.remove("active");
  document.getElementById('aboutTab').classList.remove("active");
}

function focusTab(who){
  clearRooms();
  resetTabs();
  document.getElementById(who).classList.add("active");
}

function getMyRooms(){
    //if(hasAccess(localStorage.getItem("MeTooAccessToken"))!=false){
      var xhr = new XMLHttpRequest();
      var url = "http://127.0.0.1:8090/rooms/myrooms/"+localStorage.getItem("MeTooAccessToken");
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
              var json = JSON.parse(xhr.responseText);
              localStorage.setItem("MeTooRooms",JSON.stringify(json));
              focusTab('yourRoomsTab');
              listRooms(yourRooms=true);
          }
      };    
      xhr.send(null);

  
}


function getRooms(lat,lon){
    var range = 10.1;
    localStorage.setItem("userLat",lat);
    localStorage.setItem("userLon",lon);
    //if(hasAccess(localStorage.getItem("MeTooAccessToken"))!=false){
      var xhr = new XMLHttpRequest();
      var url = "http://127.0.0.1:8090/rooms/"+range+"/"+lat+"/"+lon;
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
              var json = JSON.parse(xhr.responseText);
              localStorage.setItem("MeTooRooms",JSON.stringify(json));
              focusTab('browseTab');
              listRooms();
          }
      };    
      xhr.send(null);
}

function areTheSame(a,b){
  a = a.toString();
  b = b.toString();
  if(a===b)
    return true;

  return false;
}

function notify(room){
  var iconNotification = 'assets/notification.png';
  var xhr = new XMLHttpRequest();
    var url = "http://127.0.0.1:8090/profile/picture/"+room['owner'];
    xhr.open("GET", url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            if(json['status'])
              if(json['url']!='http://127.0.0.1:8000/def.png'){
                  iconNotification = json['url'];
              }   
            }
    };
    xhr.send(null);



  var title = room['owner']+' just open a room near you';
  var en = new Notification(title, { 
        body: 'MeToo: '+room['roomName'],
        icon: iconNotification,
        sound: '/assets/sounds/notification.mp3'
      }).onclick = function(event) {
        event.preventDefault();
        localStorage.setItem("roomToLoad",room['roomID']);
        window.location.replace("RoomDescription.html");
      };
      en.onshow = function() { setTimeout(en.close, 4000) };
}


function getRoomIds(rooms){
  var toReturn = [];
  rooms['rooms'].forEach(function(room){
      toReturn.push(room['roomID']);
  });
  return toReturn;
}

function getNewerRooms(newRooms,oldRooms){
  var toReturn = [];
  newRooms.forEach(function(id){
    if(!(oldRooms.includes(id)))
      toReturn.push(id);
    
  });
  return toReturn;
}

function getRoomsInRange(range,lat,lon){
    localStorage.setItem("userLat",lat);
    localStorage.setItem("userLon",lon);
      var xhr = new XMLHttpRequest();
      var url = "http://127.0.0.1:8090/rooms/"+range+"/"+lat+"/"+lon;
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
              var json = JSON.parse(xhr.responseText);
              var localItems = localStorage.getItem("checkNewRooms");

              if(!areTheSame(JSON.stringify(json),localItems)){
                var newRooms = getRoomIds(json);
                var oldRooms = getRoomIds(JSON.parse(localStorage.getItem("checkNewRooms")));
                var newerRooms = getNewerRooms(newRooms,oldRooms);
                newRooms = [];
                newerRooms.forEach(function(id){
                    json['rooms'].forEach(function(room){
                        if(room['roomID']===id && room['owner']!=localStorage.getItem("username")){
                            notify(room);
                        } 
                    });
                });

                localStorage.setItem("checkNewRooms",JSON.stringify(json));
              }
              
          }
      };    
      xhr.send(null);
}

function setPositions(position){
        window.userlat = position.coords.latitude;
        window.userLon = position.coords.longitude;
        getRooms(position.coords.latitude,position.coords.longitude);
}

function getLocation(){
    var lat = localStorage.getItem("userLat");
    var lon = localStorage.getItem("userLon");
    if(lat===null&&lon===null){
      if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(setPositions);
      }
      else{
        alert("Your browser does not support location");
      }
    }
    else{
      getRooms(localStorage.getItem("userLat"),localStorage.getItem("userLon"));
      sendLocation();

    }
}

function sendLocation(){
      var xhr = new XMLHttpRequest();
      var url = "http://127.0.0.1:8090/iamhere"
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
              var json = JSON.parse(xhr.responseText);
          }
      };    
      var data = JSON.stringify({"accessToken": localStorage.getItem("MeTooAccessToken"),"lat":localStorage.getItem("userLat"),"lon":localStorage.getItem("userLon")});  
      xhr.send(data);
}

function deleteRoom(roomID){
  var accessToken = localStorage.getItem("MeTooAccessToken");
  var xhr = new XMLHttpRequest();
      var url = "http://127.0.0.1:8090/rooms/delete/"+roomID+"/"+accessToken;
      xhr.open("DELETE", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
              var json = JSON.parse(xhr.responseText);
              document.getElementById(roomID).remove();
          }
      };
      xhr.send(null);}

function printRoom(yourRooms,roomID,roomName,location,lobby,lobbySize,owner,title,link){
  if(lobby==undefined)
      return 0;
  var roomOcupation = String(lobby.length)+"/"+String(lobbySize);
  //console.log(roomName,location,roomOcupation,owner);
  if(link===""||link===null){
      link = "http://maps.google.com/?ie=UTF8&hq=&ll="+location.split(' ').toString()+"&z=18";
  }
  table = document.getElementById('listedRooms');
  if(yourRooms)
    {
      table.innerHTML +=`
    <tr id="`+roomID+`"">
      <td onclick='openRoom("`+roomID+`")' >`+roomName+`</td>
        <td onclick='window.open("`+link+`")' ><img class="location" alt="SmileyFace" src="assets/location.png">`+title+`</td>
        <td>`+roomOcupation+`</td>
        <td>`+owner+`</td>
        <td><img class="location" style="width: auto;" alt="SmileyFace" src="assets/delete.png" onclick='deleteRoom("`+roomID+`")' ></td>
    </tr>`;
    }
    else{
      table.innerHTML +=`
    <tr id="`+roomID+`"">
      <td onclick='openRoom("`+roomID+`")' >`+roomName+`</td>
        <td onclick='window.open("`+link+`")' ><img class="location" alt="SmileyFace" src="assets/location.png">`+title+`</td>
        <td>`+roomOcupation+`</td>
        <td>`+owner+`</td>
    </tr>`;
    }
  
}



Notification.requestPermission(function (status) {
      if (Notification.permission !== status) {
        Notification.permission = status;
      }
      if (Notification.permission === 'granted') {
        console.log("granted");
      } else {
        console.log(status);
      }
    });



function listRooms(yourRooms=false){

  var obj = getFromLocal("MeTooRooms");
  for(var iterator in obj['rooms']){
    var room = obj['rooms'][iterator];
    printRoom(yourRooms,room['roomID'],room['roomName'],room['location'],room['lobby'],room['lobbySize'],room['owner'],room['title'],room['link']);
  }

  var obj = getFromLocal("toAdd");
  if(obj!=null){
    printRoom(room['roomID'],obj['roomname'],obj['location'],obj['lobby'],obj['size'],obj['owner'],obj['title'],obj['link']);
    localStorage.setItem("toAdd",null);
  }


}

function openRoom(roomID){
  localStorage.setItem("roomToLoad",roomID);
  window.location.replace("RoomDescription.html");
}


function loadRooms(){
  getLocation();
}

function kickIfForegin(){
  var accessToken = localStorage.getItem("MeTooAccessToken");
  if(accessToken===null){
      window.location.replace('Login.html');
  }
  else{
    var xhr = new XMLHttpRequest();
    var url = "http://127.0.0.1:8090/whoami";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            if(json['username']==false){
                localStorage.removeItem("MeTooAccessToken");
                window.location.replace('Login.html');
            }
            else{
                localStorage.setItem("username",json['username']);
            }
            
        }
    };
    var data = JSON.stringify({"accessToken": accessToken});
    xhr.send(data);
      
  }
}

kickIfForegin();
loadRooms();


window.setInterval(function checkVars(){
  getRoomsInRange(10.1,localStorage.getItem("userLat"),localStorage.getItem("userLon"));

},5000);
