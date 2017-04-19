var page = require('webpage').create();

page.open('https://mobile.twitter.com/login', function(status) {
    if(status !== "success") {
        console.log("Unable to load url.");
        phantom.exit();
    }
    console.log('Now login...');
    page.evaluate(function() {
        document.getElementById("session[username_or_email]").value = "";
        document.getElementById("session[password]").value = "";
        document.forms[0].submit();
    });
    var is_logged_in = page.evaluate(function() {
        return document.getElementById("session[username_or_email]") == null;
    });
    if(!is_logged_in) {
        console.log('Unable to login. Please check username, email, password.');
        phantom.exit();
    }
    page.onLoadFinished = loggedIn
});

function loggedIn() {
    console.log('Logged in.');

    page.onLoadFinished = null;
    page.open('https://mobile.twitter.com/follower_requests', function(status) {
        if(status !== "success") {
            console.log("Unable to load follower requests page.");
            phantom.exit();
        }
        console.log('Fetching follower requests.');
        var forms = page.evaluate(function() {
            return document.forms;
        });
        if(forms[0]) {
            console.log('Requests found!');
            approve();
        } else {
            console.log('No follower requests found.');
            phantom.exit();
        }
    });
}

function approve() {
    var flag = page.evaluate(function() {
        if(!document.forms[0] || document.forms[0].action.indexOf("search") !== -1) {
            return false;
        } else {
            var ref = document.getElementsByClassName("fullname")[0].parentNode.href;
            document.forms[0].submit();
            return ref.replace(/.*\/(.*?)\?.*/, "$1");
        }
    });
    if(flag) {
        console.log('Approve: ' + flag);
        page.onLoadFinished = approve;
    } else {
        page.onLoadFinished = null;
        console.log('Approved requests.');
        phantom.exit();
    }
}