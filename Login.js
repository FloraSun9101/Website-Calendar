function logedin(data) {
    document.getElementById("loginField").style.display = "none"; // hide the login field
    document.getElementById("login_btn").removeEventListener("click", loginAjax, false);

    document.getElementById("registerField").style.display = "none"; // hide the register field
    document.getElementById("register_btn").removeEventListener("click", registerPage, false);

    document.getElementById("logoutField").style.display = "block"; // show the logoutField
    document.getElementById("greeting").textContent = `Hi! ${data.username}`;
    document.getElementById("logout_btn").addEventListener("click", logoutAjax, false);

    $("#eventToken").val(data.token); // add the value of the token to the html file
    document.getElementById("eventBtnField").style.display = "block"; // show the event button field
    document.getElementById("addEventButton").addEventListener("click", showEventField, false);

    showEventView();
}

function loginAjax(event) {
    let username = document.getElementById("username").value; // Get the username from the form
    const password = document.getElementById("password").value; // Get the password from the form

    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username, 'password': password };

    fetch("Login.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
	    // if log in successfully
	    if(data.success){
		logedin(data);
	    } else {
		let loginWarning = document.createElement("p");
		loginWarning.textContent = `You were not logged in: ${data.message}`;
		loginWarning.style.backgroundColor = "#F5A9A9";
		document.getElementById("loginField").appendChild(loginWarning);
	    }
	})
        .catch(err => console.error(err));
}

document.getElementById("login_btn").addEventListener("click", loginAjax, false); // Bind the AJAX call to button click

function logedout() {
    // when log out, show the login and register fields again.
    const loginField = document.getElementById("loginField");
    while(loginField.getElementsByTagName("p").length) { // remove any possible log in warnings generated before
	loginField.removeChild(loginField.getElementsByTagName("p")[0]);
    }
    loginField.style.display = "block"; // show the login field
    document.getElementById("login_btn").addEventListener("click", loginAjax, false);

    document.getElementById("registerField").style.display = "block"; // show the register field
    document.getElementById("register_btn").addEventListener("click", registerPage, false);

    document.getElementById("logoutField").style.display = "none"; // hide the logoutField
    document.getElementById("greeting").textContent = "";
    document.getElementById("logout_btn").removeEventListener("click", logoutAjax, false);

    document.getElementById("eventBtnField").style.display = "none"; // hide the event buttons
    document.getElementById("addEventButton").removeEventListener("click", showEventField, false);

    document.getElementById("eventField").style.display = "none"; // hide the event field;
    $("#eventToken").val("");
    $(".eventButton").remove();
}

function registerPage(event) {
    window.open("register.html");
}

document.getElementById("register_btn").addEventListener("click", registerPage, false); // open register page in a new tag to avoid the reload of the main page.

function checkLoginAjax(event) {
    fetch("checkLogin.php", {
	method: "POST"
    })
	.then(response => response.json())
	.then(data => {
	    if(data.login) { // the user has already logged in
		logedin(data);
	    }
	    else {
		logedout();
	    }
	})
	.catch(err => console.error(err));
}
document.addEventListener("DOMContentLoaded", checkLoginAjax, false);

function logoutAjax(event) {
    fetch("Logout.php", {
	method: "POST"
    })
	.then(() => logedout())
	.catch(err => console.error(err));
}

function showEventField() {
    $("#eventField").css("display", "block");
    document.getElementById("submitEvent").addEventListener("click", submitEventAjax, false);
}

