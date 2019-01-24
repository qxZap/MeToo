document.getElementById('login_check').style.display = 'none';
stopLoading()
var creditals = [];

document.getElementById('loginForm').addEventListener('keypress', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });
$("#loginForm").submit(function(e) {
    e.preventDefault();
});

function startLoading(){
	document.getElementById('loginBtn').style.display = 'none';
	document.getElementById('loading').style.display = 'block';

}

function stopLoading(){
	document.getElementById('loginBtn').style.display = 'block';
	document.getElementById('loading').style.display = 'none';
}

function login(){
	var username = document.getElementById("username").value;
	var passwordPure = document.getElementById("password").value;
	if (username!=""&&password!=""&&!creditals.includes(String(username+'///'+passwordPure))){
		startLoading();
		var password = MD5(passwordPure);
		var xhr = new XMLHttpRequest();
		var url = "http://127.0.0.1:8090/login";
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
		    if (xhr.readyState === 4 && xhr.status === 211) {
		        var json = JSON.parse(xhr.responseText);
		        localStorage.setItem("MeTooAccessToken",json['accessToken']);
		        window.location.replace('Dashboard.html');
		    }
		    if (xhr.status === 212){
		    	document.getElementById('login_check').style.display = 'block';
		    	document.getElementById('login_check').innerHTML = "<font color="+"red"+">Wrong creditals</font>"
		    	creditals.push(String(username+'///'+passwordPure));
		    	//To Do in that case
		    }

			stopLoading();

		};
		var data = JSON.stringify({"username": username, "password": password});
		xhr.send(data);
	}
	
}