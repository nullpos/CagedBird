var page = require('webpage').create();
var fs = require('fs');

var whitelist = [], blacklist = [];
try {
    whitelist = fs.read('whitelist.txt');
    whitelist = whitelist.split('\n').map(function(str){ return str.trim(); });
} catch(e) {}
try {
    blacklist = fs.read('blacklist.txt');
    blacklist = blacklist.split('\n').map(function(str){ return str.trim(); });
} catch(e) {}


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
    page.onLoadFinished = loggedIn;
});

function loggedIn() {
    var is_logged_in = page.evaluate(function() {
        return document.getElementById("session[username_or_email]") == null;
    });
    if(!is_logged_in) {
        console.log('Unable to login. Please check username, email, password.');
        phantom.exit();
    }

    console.log('Logged in.');

    page.onLoadFinished = null;
    page.open('https://mobile.twitter.com/follower_requests', function(status) {
        if(status !== "success") {
            console.log("Unable to open follower requests page.");
            phantom.exit();
        }
        console.log('Fetching follower requests.');
        var exist_req = page.evaluate(function() {
            return !document.getElementsByClassName('empty-list')[0];
        });
        if(exist_req) {
            console.log('Requests found!');
            nextPage();
        } else {
            console.log('No follower requests found.');
            phantom.exit();
        }
    });
}

function nextPage() {
    var next_page = page.evaluate(function() {
        var wbm = document.getElementsByClassName('w-button-more')[0];
        if(wbm) {
            return wbm.firstChild.href;
        } else {
            return false;
        }
    });
    approve(next_page);
}

function approve(next) {
    var data = page.evaluate(function(whitelist, blacklist) {
        var forms = document.forms;
        for(var i = 0; i < forms.length; i += 2) {
            if(forms[i].action.indexOf("search") !== -1) {
                // search box
                return {"approve": false, "username": ""};
            }
            var ref = document.getElementsByClassName("fullname")[i/2].parentNode.href;
            var username = ref.replace(/.*\/(.*?)\?.*/, "$1");

            if(whitelist.length === 0 && blacklist.length === 0) {
                // approve all
                forms[i].submit();
                return {"approve": true, "username": username};
            } else if(whitelist.length !== 0 && blacklist.length === 0) {
                // approve in whitelist, nop others
                if(whitelist[0] === "all") {
                    forms[i].submit();
                    return {"approve": true, "username": username};
                } else if(whitelist.indexOf(username) !== -1) {
                    forms[i].submit();
                    return {"approve": true, "username": username};
                } else {
                    // no operation
                }
            } else if(whitelist.length === 0 && blacklist.length !== 0) {
                // deny in blacklist, nop others
                if(blacklist[0] === "all") {
                    forms[i+1].submit();
                    return {"approve": false, "username": username};
                } else if(blacklist.indexOf(username) !== -1) {
                    forms[i+1].submit();
                    return {"approve": false, "username": username};
                } else {
                    // no operation
                }
            } else if(whitelist.length !== 0 && blacklist.length !== 0) {
                // approve whitelist and deny blacklist, nop others
                if(blacklist[0] === "all") {
                    forms[i+1].submit();
                    return {"approve": false, "username": username};
                } else if(whitelist[0] === "all") {
                    forms[i].submit();
                    return {"approve": true, "username": username};
                }
                if(blacklist.indexOf(username) !== -1) {
                    forms[i+1].submit();
                    return {"approve": false, "username": username};
                } else if(whitelist.indexOf(username) !== -1) {
                    forms[i].submit();
                    return {"approve": true, "username": username};
                } else {
                    // no operation
                }
            }
        }
    }, whitelist, blacklist);

    if(data.username === "") {
        // all clear in this page
        if(next) {
            console.log(next);
            page.open(next);
            page.onLoadFinished = nextPage;
        } else {
            console.log('All process finished.');
            phantom.exit();
        }
    } else {
        if(data.approve) {
            console.log('Approve: ' + data.username);
        } else {
            console.log('Deny: ' + data.username);
        }
        page.onLoadFinished = nextPage;
    }
}