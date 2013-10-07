var tincan;
var loggedIn = 0;

// BEGIN CONTEXT MENU

var id = chrome.contextMenus.create(
	{
		"title": "Send Selection", 
		"contexts": ["selection", "video", "image", "audio"],
		"onclick": sendSelection
		});

function sendSelection () {
	if(loggedIn == 0)
		login(localStorage.LRSUsername, localStorage.LRSPassword, function () { 
      sendStatement(function (err) {
        if(err !== null) {
          alert(err.data);
        }
      }); 
    });
	else
		sendStatement(function (err) {
      if(err !== null) {
        alert(err.data);
      }
    });
}

// END CONTEXT MENU

// BEGIN TIN CAN

login = function (m_username, m_password, success) {
	console.log("Logging in...");

	tincan = new TinCan ({
  		recordStores: [{
          endpoint: "http://35.9.22.105:8000/xapi/",
          username: m_username,
          password: m_password
        }]
	});

	tincan.getStatements(
	{
	  // 'params' is passed through to TinCan.LRS.queryStatements
	  params: {
	    since: "2013-09-22 07:42:10CDT",
	    limit: 1
	  },
	  callback: function (err, result) {
	    if (err !== null) {
	      loggedIn = 0;
	    }
	    else {
	      loggedIn = 1;
	      success();
	    }
		localStorage.LRSLoggedIn = loggedIn;
		localStorage.LRSUsername = m_username;
		localStorage.LRSPassword = m_password;
      }
	});
}

sendStatement = function (callback) {
  console.log("begin sending...");
  console.log("getting tab...");
  getCurrentTab (function (tab) {
      if(tab) {
        console.log("getting selected text...");
        chrome.tabs.sendMessage(tab.id, {method: "getSelection"}, function (response) {
          console.log("creating statement...");
          var statement = {
            actor : {
              "objectType" : "Agent",
              "mbox" : "mailto:" + localStorage.LRSUsername
            },
            verb : {
              "id" : "http://adlnet.gov/expapi/verbs/experienced",
              "display" : {}
            },
            object : {
              "id" : tab.url,
              "definition" : {
                "name": {"en-US":tab.title},
                "description": {"en-US": response.data}
              }
            }
          };
          console.log("statement created...");

          console.log("sending statement...");
          tincan.sendStatement(statement, function () {
            console.log("Statement Sent.");
            callback(null);
          });
        });
      } else {
        console.log("Failed to send Statement");
        callback({data: "failure to send"});
        //if(button) button.attr("disabled", false);
      }
  });
}

logout = function (callback) {
  console.log("Logging out.");
  if(loggedIn != 0) {
    loggedIn = 0;
    callback();
  }
  localStorage.LRSLoggedIn = 0;
}

// END TIN CAN

function getCurrentTab(callback) {
  chrome.tabs.query ({
      active: true,
      currentWindow: true
    }, function (tabs) {
      callback(tabs[0]);
    });
}

