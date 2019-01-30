

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
    var range = 300.1;
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
    }
}

function deleteRoom(roomID){
  var accessToken = localStorage.getItem("MeTooAccessToken");
  var xhr = new XMLHttpRequest();
      var url = "http://127.0.0.1:8090/rooms/delete/"+roomID;
      xhr.open("DELETE", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
              var json = JSON.parse(xhr.responseText);
          }
      };
      var data = JSON.stringify({"accessToken": accessToken});   
      xhr.send(data);}

function printRoom(yourRooms,roomID,roomName,location,lobby,lobbySize,owner,title,link){
  var roomOcupation = String(lobby.length)+"/"+String(lobbySize);
  //console.log(roomName,location,roomOcupation,owner);
  if(link===""||link===null){
      link = "http://maps.google.com/?ie=UTF8&hq=&ll="+location.split(' ').toString()+"&z=18";
  }
  table = document.getElementById('listedRooms');
  if(yourRooms)
    table.innerHTML +=`
    <tr>
      <td>`+roomName+`</td>
        <td onclick='window.open("`+link+`")' ><img class="location" alt="SmileyFace" src="assets/location.png">`+title+`</td>
        <td>`+roomOcupation+`</td>
        <td>`+owner+`</td>
        <td><img class="location" style="width: auto;" alt="SmileyFace" src="assets/delete.png" onclick='deleteRoom("`+roomID+`")' ></td>
    </tr>`;
    else{
      table.innerHTML +=`
    <tr>
      <td>`+roomName+`</td>
        <td onclick='window.open("`+link+`")' ><img class="location" alt="SmileyFace" src="assets/location.png">`+title+`</td>
        <td>`+roomOcupation+`</td>
        <td>`+owner+`</td>
    </tr>`;
    }
  
}

// <tr onclick='window.open("http://www.google.com")'> 
//              <td>C++ Board Game</td>  
//              <td><img class="location" alt="SmileyFace" src="assets/location.png">  Mama Mia</td> 
//             <td>2/3</td>  
//             <td>Radozaur</td> 
//           </tr>


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

function logOut(){
      var xhr = new XMLHttpRequest();
      var url = "http://127.0.0.1:8090/deleteme/"+localStorage.getItem("MeTooAccessToken");
      xhr.open("DELETE", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
              var json = JSON.parse(xhr.responseText);
              localStorage.removeItem("MeTooAccessToken");
              window.location.replace('Login.html')
          }
      };    
      xhr.send(null);
  ;
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
                window.location.replace('Login.html');
                localStorage.removeItem("MeTooAccessToken");
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