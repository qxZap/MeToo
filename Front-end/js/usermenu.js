
if(localStorage.getItem("profilePictureLink")){
	document.getElementById('profilePicture').src="http://127.0.0.1:8000/"+localStorage.getItem("profilePictureLink"); 
}
else{
		var xhr = new XMLHttpRequest();
		var url = "http://127.0.0.1:8090/profile/picture/"+localStorage.getItem("username")+'/'+localStorage.getItem("MeTooAccessToken");
		xhr.open("GET", url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
		    if (xhr.readyState === 4 && xhr.status === 200) {
		        var json = JSON.parse(xhr.responseText);
		        if(json['status'])
		        	if(json['url']==='http://127.0.0.1:8000/'){
		        		document.getElementById('profilePicture').src="assets/UserPhoto.png";
		        	}
		        	else{
		        		document.getElementById('profilePicture').src="http://127.0.0.1:8000/"+json['url']; 
		        		localStorage.setItem("profilePictureLink",json['url']);   
		        	}    
		        }
		};
		xhr.send(null);

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
              localStorage.removeItem("profilePictureLink");
              localStorage.removeItem("username");
              window.location.replace('Login.html');
          }
      };    
      xhr.send(null);
  ;
}


$(document).ready(function(){
$(".account").click(function()
{
var X=$(this).attr('id');
if(X==1)
{
$(".submenu").hide();
$(this).attr('id', '0'); 
}
else
{
$(".submenu").show();
$(this).attr('id', '1');
}
});
$(".submenu").mouseup(function()
{
return false
});
$(".account").mouseup(function()
{
return false
});
$(document).mouseup(function()
{
$(".submenu").hide();
$(".account").attr('id', '');
});
});

