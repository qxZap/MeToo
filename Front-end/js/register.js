
var registerFlag = false;
var prevName = "";
var prevMail = "";
var usernames = {};
var emails = {};

document.getElementById('registerForm').addEventListener('keypress', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });

$("#registerForm").submit(function(e) {
    e.preventDefault();
});

window.onload = function() {
  document.getElementById('name').placeholder ="Your username";
  document.getElementById('name').innerHTML ="";
  document.getElementById('mail').placeholder ="Your Email";
  document.getElementById('mail').innerHTML ="";
  document.getElementById('password').placeholder ="Your Password";
  document.getElementById('password').innerHTML ="";
  document.getElementById('password2').placeholder ="Retype it";
}




function getLabel(searchedLabel){
	var found = false;
	var labels = document.querySelectorAll('label');
	var toReturn = ""; 
	[].forEach.call(labels, function(label) {
		if(searchedLabel===label.htmlFor&&!found){
			found=true;
			toReturn = label;
		}
	});
	return toReturn
}


function register(){
	var name = document.getElementById("name").value;
	var mail = document.getElementById("mail").value;
	var date = document.getElementById("date").value;
	var password1 = document.getElementById("password").value;
	var password2 = document.getElementById("password2").value;
	var country = document.getElementById("country").value;
	if(registerFlag){
		var password = MD5(password1);
		var xhr = new XMLHttpRequest();
		var url = "http://127.0.0.1:8090/register";
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
		    if (xhr.readyState === 4 && xhr.status === 200) {
		        var json = JSON.parse(xhr.responseText);
		        window.location.replace('ThankYou.html');
		    }
		};
		var data = JSON.stringify({"username": name, "password": password,"email": mail,"date":date,"country":country});
		xhr.send(data);
	}

}

window.setInterval(function checkVars(){
	var name = document.getElementById("name").value;
	var mail = document.getElementById("mail").value;
	if(usernames[name]==='taken'){
		document.getElementById("nameLabel").innerHTML="Name:&#x274C;<font color="+"red"+"> This username is already taken</font>";
	}
	else if(usernames[name]==='ok'){
		document.getElementById("nameLabel").innerHTML="Name:✅";
	}

	if(emails[mail]==='taken'){
		document.getElementById("mailLabel").innerHTML="Email:&#x274C;<font color="+"red"+"> This email adress is already taken</font>";
	}
	else if(emails[mail]==='ok'){
		document.getElementById("mailLabel").innerHTML="Email:✅";
	}


},1000);


window.setInterval(function checkUsername(){
	var name = document.getElementById("name").value;
	if(name!=""&&name!=prevName&&usernames[name]===undefined) {
		var xhr = new XMLHttpRequest();
		var url = "http://127.0.0.1:8090/userexists/"+name;
		xhr.open("GET",url,true);
		prevName = name;
		xhr.onreadystatechange = function () {
			    if (xhr.readyState === 4 && xhr.status === 211) {
			    	registerFlag = false;
					document.getElementById("nameLabel").innerHTML="Name:&#x274C;<font color="+"red"+"> This username is already taken</font>";
					usernames[name]='taken';
			    }
			    if(xhr.status == 212) {
			    	registerFlag = true;
					document.getElementById("nameLabel").innerHTML="Name:✅";
					usernames[name]='ok';
			    }
			};
		xhr.send(null);
	}

},2000);




window.setInterval(function chekEmail(){
	var mail = document.getElementById("mail").value;
	

	if(mail!=""&&mail!=prevMail&&emails[mail]===undefined) {
		var regex = /\w+@\w+.\w/g;
		var checker = mail.match(regex);
		if (checker&&mail.match(regex)[0]&&usernames[mail]!='taken'){
			var xhr = new XMLHttpRequest();
			var url = "http://127.0.0.1:8090/mailexits/"+mail;
			xhr.open("GET",url,true);
			prevMail = mail;
			xhr.onreadystatechange = function () {
				    if (xhr.readyState === 4 && xhr.status === 211) {
				    	registerFlag = false;
						document.getElementById("mailLabel").innerHTML="Email:&#x274C;<font color="+"red"+"> This email adress is already taken</font>";
						emails[mail]='taken';

				    }
				    if(xhr.status == 212) {
				    	registerFlag = true;
						document.getElementById("mailLabel").innerHTML="Email:✅";
						emails[mail]='ok';
				    }
				};
			xhr.send(null);
		}

		
	}

},2000);





window.setInterval(function checkInput(){
	var name = document.getElementById("name").value;
	var mail = document.getElementById("mail").value;
	var date = document.getElementById("date").value;
  	var password1 = document.getElementById("password").value;
  	var password2 = document.getElementById("password2").value;
	if (password1!=password2){
		document.getElementById("passwordLabel").innerHTML="Password:&#x274C;<font color="+"red"+"> Passwords must be the same</font>";
		registerFlag = false;
	}
	else{
		if(password1!=""){
			document.getElementById("passwordLabel").innerHTML="Password:✅";
			registerFlag = true;
		}
		else{
			document.getElementById("passwordLabel").innerHTML="Password:";
			registerFlag = false;
		}
	}

	if(password1===""||mail===""||name===""||date===""){
		registerFlag = false;
	}


}, 500);

