var bgScript = chrome.extension.getBackgroundPage();
var transitionAnimationLength = 200;  // in ms

$(document).ready ( function () {

	// EVENTS

  	$("#sendStatementButton").click (function () {
      $("#sendStatementButton").attr("disabled", "disabled");
      bgScript.getCurrentTab(function (tab) {
        var act = "experienced";
        var obj = {
          "id" : tab.url,
          "definition" : {
            "name": {"en-US": tab.title},
            "description": {"en-US": ""}
          }
        };

        console.log(tab.url);
        if (tab.url.indexOf("http://www.youtube.com/watch?v=") != -1) {
          act = "watched";
          obj.definition.description['en-US'] = tab.url.substring(31);
        }

        bgScript.sendStatement(act, obj, function (err) {
          if(err != null) {
            $("#sendStatementButton").attr("disabled", false);
          } else {
            $("#sendStatementButton").html ("Sent!");
          }
        });

      });
    });

  	$("#loginButton").click (function () {
      bgScript.login($("#username").val(), $("#password").val(), loginAnimation);
  	});

    $("#logoutButton").click (function () {
      bgScript.logout(logoutAnimation);
    });

    $("#gotoWebsite").click (function () {
      chrome.tabs.create ({url: $("#gotoWebsite").attr("href")});
    });

    $("#register").click (function () {
      chrome.tabs.create ({url: $("#register").attr("href")});
    });

  // END EVENTS

  // LOGIN SEQUENCE

  if(bgScript.loggedIn != 0) {
    loginAnimation();
  } else {
    if(localStorage.LRSLoggedIn == 1) {
      bgScript.login(localStorage.LRSUsername, localStorage.LRSPassword, loginAnimation);
    } else {
      logoutAnimation();
    }
  }

  // END LOGIN SEQUENCE
});

function loginAnimation() {
  $("#sendStatementButton").attr("disabled", false);
  $("#sendStatementButton").html ("Send");
  $("#panel").slideUp (transitionAnimationLength, function () {
    $("#userPanel").show();
    $("#loginPanel").hide();
    $("#panel").slideDown (transitionAnimationLength);
  });
}

function logoutAnimation() {
  $("#panel").slideUp (transitionAnimationLength, function () {
    $("#userPanel").hide();
    $("#loginPanel").show();
    $("#panel").slideDown (transitionAnimationLength);
  });
}