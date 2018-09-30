// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//= require warp-cable
//= require activestorage
//= require turbolinks
//= require_tree .

// function ajax_get(url, callback) {
// 	var xmlhttp = new XMLHttpRequest();
// 	xmlhttp.onreadystatechange = function() {
// 			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
// 					console.log('responseText:' + xmlhttp.responseText);
// 					try {
// 							var data = JSON.parse(xmlhttp.responseText);
// 					} catch(err) {
// 							console.log(err.message + " in " + xmlhttp.responseText);
// 							return;
// 					}
// 					callback(data);
// 			}
// 	};

// 	xmlhttp.open("GET", url, true);
// 	xmlhttp.send();
// }

// ajax_get("/sample-request", function(data) {
// 	console.log("Got the data, hit the callback");
// 	debugger
// 	alert(JSON.parse(data));
// })

// postData(`http://example.com/answer`, {answer: 42})
//   .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
//   .catch(error => console.error(error));

function postData(url = ``, data = {}) {
  // Default options are marked with *
    return fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
		.then(response => response.json()) // parses response to JSON
}

function getData(url = ``, data = {}) {
// Default options are marked with *
    return fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        }
    })
        .then(response => response.json()) // parses response to JSON
}