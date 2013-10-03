var tincan;
var loggedIn = 0;

var transitionAnimationLength = 200;  // in ms

$(document).ready ( function () {

	// EVENTS

  	$("#sendStatementButton").click (function () {sendStatement();});

  	$("#loginButton").click (function () {
      login($("#username").val(), $("#password").val());
  	});

    $("#logoutButton").click (function () {
      logout();
    });

  // END EVENTS

  loggedIn = 0;
  if (localStorage.LRSLoggedIn) {
    loggedIn = localStorage.LRSLoggedIn;
  };
  console.log("Logged in? " + loggedIn);

  if (loggedIn == 1) {
      var _username = localStorage.LRSUsername;
      var _password = localStorage.LRSPassword;
      login (_username, _password);
      return;
  }
  $("#userPanel").hide();
  $("#panel").slideDown (transitionAnimationLength);
 });

function login(m_username, m_password) {
  console.log("Logging in...");
  loggedIn = 0;
  tincan = new TinCan ({
      recordStores: [{
          endpoint: "http://35.9.22.105:8000/xapi/",
          username: m_username,
          password: m_password
        }]
    });

  //tincan.recordStores[0].auth = "Basic " + TinCan.Utils.getBase64String(m_username + ":" + m_password);

  tincan.getStatements(
    {
      // 'params' is passed through to TinCan.LRS.queryStatements
      params: {
        since: "2013-09-22 07:42:10CDT",
        limit: 1
      },
      callback: function (err, result) {
        // 'err' will be null on success
        if (err !== null) {
          // handle error
          loggedIn = 0;
          return;
        }
        else {
          loggedIn = 1;
          $("#sendStatementButton").attr("disabled", false);
          $("#sendStatementButton").html ("Send");
          $("#panel").slideUp (transitionAnimationLength, function () {
            $("#userPanel").show();
            $("#loginPanel").hide();
            $("#panel").slideDown (transitionAnimationLength);
          });
        }
        localStorage.LRSLoggedIn = loggedIn;
        localStorage.LRSUsername = m_username;
        localStorage.LRSPassword = m_password;
      }
    }
  );
}

function logout () {
  console.log("Logging out.");
  if(loggedIn == 1) {
    loggedIn = 0;
    $("#panel").slideUp (transitionAnimationLength, function () {
      $("#userPanel").hide();
      $("#loginPanel").show();
      $("#panel").slideDown (transitionAnimationLength);
    });
  }
  localStorage.LRSLoggedIn = 0;
}

function sendStatement () {
  $("#sendStatementButton").attr("disabled", "disabled");
  getCurrentTab (function (tab) {
      if(tab) {
        var statement = {
          actor : {
            "objectType" : "Agent",
            "mbox" : ""
          },
          verb : {
            "id" : "",
            "display" : {}
          },
          object : {
            "id" : "",
            "definition" : {}
          }
      };

      statement.actor.mbox = localStorage.LRSUsername;
      statement.verb.id = "http://adlnet.gov/expapi/verbs/experienced";
      statement.object.id = tab.url;
      
      tincan.sendStatement(statement, function () {
        console.log("Statement Sent");
        $("#sendStatementButton").html ("Sent!");
      });
    } else {
      console.log("Failed to send Statement");
      $("#sendStatementButton").attr("disabled", "false");
    }
  });
}

function getCurrentTab(callback) {
  chrome.tabs.query ({
      active: true, 
      highlighted: true, 
      currentWindow: true
    }, function (tabs) {
      callback(tabs[0]);
    });
}