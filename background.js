var tincan;
var loggedIn = 0;
var username = "";
var password = "";

// BEGIN CONTEXT MENU

var id = chrome.contextMenus.create({
	"title": "I Learned This", 
	"contexts": ["selection", "image"],
	"onclick": contextClicked
});

function contextClicked (clickData, tab) {
  console.log(JSON.stringify(clickData, null, 4));
  var act;
  var obj;
  if (clickData.mediaType == "image") { 
      act = "viewed";
      obj = {
        "id": clickData.pageUrl + "/" + clickData.srcUrl,
        "definition": {
          "name": {"en-US": tab.title},
          "description": {"en-US": clickData.srcUrl}
        }
      };
  }
  else if (clickData.selectionText != null || clickData.selectionText != "") {
    act = "read";
    obj = {
      "id": clickData.pageUrl + "/" + TinCan.Utils.getUUID(),
      "definition": {
        "name": {"en-US": tab.title},
        "description": {"en-US": clickData.selectionText}
      }
    };
  }

  if(loggedIn === 0) {
    alert("You need to login before you can send activities.");
  } else {
    sendStatement(act, obj, function (err) {
      if(err !== null) {
        alert(err.data);
      }
    });
  }

}

// END CONTEXT MENU

// BEGIN TIN CAN

login = function (m_username, m_password, callback) {
	console.log("Logging in...");
  username = "";
  password = "";

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
	    //since: "2013-09-22 07:42:10CDT",
	    limit: 1
	  },
	  callback: function (err, result) {
	    if (err !== null) {
	      loggedIn = 0;
        callback("Invalid Username and/or Password");
	    }
	    else {
	      loggedIn = 1;
        username = m_username;
        password = m_password;
	      callback(null);
	    }
  		localStorage.LRSLoggedIn = loggedIn;
  		localStorage.LRSUsername = username;
  		localStorage.LRSPassword = password;
    }
	});
}

sendStatement = function (act, obj, callback) {
  console.log("begin sending...");
  console.log("creating statement...");
  var statement = {
    actor : {
      "objectType" : "Agent",
      "mbox" : "mailto:" + localStorage.LRSUsername,
      "name" : localStorage.LRSUsername
    },
    verb : {
      "id" : "http://verbs/" + act + "/",
      "display" : {"en-US": act.charAt(0).toUpperCase() + act.slice(1) }
    },
    object : obj
  };
  console.log("sending statement...");

  tincan.sendStatement(statement, function (err) {
    if(err[0].err === null) {
      console.log("Statement Sent.");
    } else {
      alert("Failed to Send Statement. Error: " + err[0].err);
    }

    callback(err[0].err);
  });
}

logout = function (callback) {
  console.log("Logging out.");
  if(loggedIn !== 0) {
    loggedIn = 0;
    callback();
  }
  localStorage.LRSLoggedIn = 0;
}

// END TIN CAN

getCurrentTab = function (callback) {
  chrome.tabs.query ({
      active: true,
      currentWindow: true
    }, function (tabs) {
      callback(tabs[0]);
    });
}

