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
		        if(json['username']&&document.getElementById("superDiv")){
		        	document.getElementById("superDiv").style.display = "block";
		        }
		        else{
		        	localStorage.removeItem("MeTooAccessToken");
		        	window.location.replace('Login.html');
		        }
		    }
		};
		var data = JSON.stringify({"accessToken": accessToken});
		xhr.send(data);
     	
  }
}

function hasAccess(accessToken){
	var xhr = new XMLHttpRequest();
		var url = "http://127.0.0.1:8090/whoami";
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
		    if (xhr.readyState === 4 && xhr.status === 200) {
		        var json = JSON.parse(xhr.responseText);
		        return json['username'];
		    }
		};
		var data = JSON.stringify({"accessToken": accessToken});
		xhr.send(data);
	return false;
}

kickIfForegin();