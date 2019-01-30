var newPassowordCheck = false;
var newPicture = null;
document.getElementById('changePasswordForm').addEventListener('keypress', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });

$("#changePasswordForm").submit(function(e) {
    e.preventDefault();
});

document.getElementById('pictureForm').addEventListener('keypress', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });

$("#pictureForm").submit(function(e) {
    e.preventDefault();
});


window.addEventListener('load', function() {
  document.getElementById('picture').addEventListener('change', function() {
      if (this.files && this.files[0]) {
          var img = document.getElementById('picture');
          img.src = URL.createObjectURL(this.files[0]); 
          img.onload = imageIsLoaded;
          var formData = new FormData();
          formData.append('image',document.getElementById('picture').files[0]);
          if(document.getElementById('picture').files[0].size/1000>2000)
          	alert("File bigger than 2MB. NextFeature?");
          newPicture = formData;		
      }
  });
});

function imageIsLoaded(e) { 
	alert(e); 
}

function changePicture(){
	

	console.log('vr sa trimit',newPicture);

	$.ajax({
    url: 'http://127.0.0.1:8090/upload/'+localStorage.getItem("username")+'/'+localStorage.getItem("MeTooAccessToken"),
    data: newPicture,
    type: 'POST',
    contentType: false, 
    processData: false, 
    success: function(data) {
      localStorage.setItem("profilePictureLink",data['link']);
      location.reload();
    }
    
	});

}
/*

$(function() {
    $('#savePicture').click(function() {
        var form_data = new FormData($('#pictureForm')[0]);
        console.log(form_data);
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8090/upload',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            success: function(data) {
                console.log('Success!');
            },
        });
    });
});

*/
window.setInterval(function checkInput(){
  	var password1 = document.getElementById("newPassword").value;
  	var password2 = document.getElementById("retypeNewPassword").value;
	if (password1!=password2){
		document.getElementById("newPasswordLabel").innerHTML="New Password:&#x274C;<font color="+"red"+"> Passwords must be the same</font>";
		newPassowordCheck = false;
	}
	else{
		if(password1!=""){
			document.getElementById("newPasswordLabel").innerHTML="New Password:✅";
			newPassowordCheck = true;
		}
		else{
			document.getElementById("newPasswordLabel").innerHTML="Password:";
			newPassowordCheck = false;
		}
	}

	if(password1===""){
		newPassowordCheck = false;
	}


}, 500);



function changePassword(){

	if(newPassowordCheck){
		var username = localStorage.getItem("username");
		var accessToken = localStorage.getItem("MeTooAccessToken");
		var oldPassword = document.getElementById("oldPassword").value;
	  	var password1 = document.getElementById("newPassword").value;
	  	var password2 = document.getElementById("retypeNewPassword").value;
	  	var newPassword = MD5(password1);
	  	var password = MD5(oldPassword);
		var xhr = new XMLHttpRequest();
		var url = "http://127.0.0.1:8090/profile/change/password";
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
		    if (xhr.readyState === 4 && xhr.status === 200) {
		        var json = JSON.parse(xhr.responseText);
		        window.location.replace('ThankYou.html');
		    }
		};
		var data = JSON.stringify({"username": username, "accessToken": accessToken,"password":password,"newPassword":newPassword});
		xhr.send(data);
	}
}