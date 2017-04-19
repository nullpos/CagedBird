var page = require('webpage').create();

page.open('https://mobile.twitter.com/login', function(status) {
    if(status !== "success") {
        console.log("Unable to load url.");
        phantom.exit();
    }
    console.log('login...');
    page.evaluate(function() {
        document.getElementById("session[username_or_email]").value = "";
        document.getElementById("session[password]").value = "";
        document.forms[0].submit();
    });
    page.onLoadFinished = loggedIn
});

function loggedIn() {
    console.log('logged in.');
    page.onLoadFinished = null;
    page.open('https://mobile.twitter.com/follower_requests', function(status) {
        if(status !== "success") {
            console.log("Unable to load url.");
            phantom.exit();
        }
        console.log('fetch follower requests');
        var forms = page.evaluate(function() {
            return document.forms;
        });
        if(forms[0]) {
            console.log('requests found');
            approve();
        } else {
            console.log('no follower requests found');
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
        console.log('approve: ' + flag);
        page.onLoadFinished = approve;
    } else {
        page.onLoadFinished = null;
        console.log('approved requests');
        phantom.exit();
    }
}