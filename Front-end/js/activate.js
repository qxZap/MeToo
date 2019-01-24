
function activate(){
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