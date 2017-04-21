# CagedBird
Auto approve/deny follower requests for Twitter protected account.

# Environment
Tested PhantomJS 2.1.1

# Usage

## whitelist.txt, blacklist.txt

To use these files can select approve/deny to requests. Put one username(a.k.a screen name) per line.

**all** in first line, all follower requests are approved/denied (in default approve all requests).

The priority of blacklist is higher than whitelist.

For example, if you put **all** in both first line, all requests are denied.

## Run

Put username or mail address and password to these lines.

```
document.getElementById("session[username_or_email]").value = "";
document.getElementById("session[password]").value = "";
```

and run

```
$ phantomjs ./main.js
```
