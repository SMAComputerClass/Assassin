// Put your JavaScript in this file.

'use strict';   // Enable "strict mode".  Note: This *must* be the first statement in the script.
                // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

console.log("Script Code Started.");      // Open your browser's Developer Console to see the output.

const MODE_ADMIN = 0;
const MODE_PLAYER = 1;

const PLAYER_STATUS_WAITING = 0;
const PLAYER_STATUS_ACTIVE = 1;
const PLAYER_STATUS_INACTIVE = 2;
const PLAYER_STATUS_BREAK = 3;

const IND_ID = 0;
const IND_NAME = 1;
const IND_STATUS = 2;
const IND_OWED = 3;
const IND_TOTAL = 4;
const IND_TARGET = 5;

const PLAYER_NOT_FOUND = -1;

const EVENT_TYPE_CREATE_GAME = 0;
const EVENT_TYPE_START_GAME = 1;
const EVENT_TYPE_ADMIN_LOGIN = 2;
const EVENT_TYPE_LOGIN = 3;
const EVENT_TYPE_INCORRECT_LOGIN = 4;
const EVENT_TYPE_LOGOFF = 5;
const EVENT_TYPE_CONFIRM_BOUNTY = 6;
const EVENT_TYPE_BOUNTY_FAILED = 7;
const EVENT_TYPE_REACTIVATE = 8;
const EVENT_TYPE_REACTIVATE_FAILED = 9;
const EVENT_TYPE_ADD_PLAYER = 10;
const EVENT_TYPE_ADD_PLAYER_FAILED = 11;
const EVENT_TYPE_BUY_BACK_IN = 12;
const EVENT_TYPE_BOMB = 13;
const EVENT_TYPE_PING_TARGET = 14;  // not implemented yet
const EVENT_TYPE_ANSWER_PING = 15;  // not implemented yet
const EVENT_TYPE_TAKE_BREAK = 16;
const EVENT_TYPE_RETURN_FROM_BREAK = 17;
const EVENT_TYPE_PAY_BOUNTY = 18;
const EVENT_TYPE_PAY_BOUNTY_FAILED = 19;

const LAST_MESSAGE_TEXT = "Last Message: ";
const ACTIVE_CHAIN_LABEL = "Active Chain: <br>";
const AWAITING_ASSIGNMENT_LABEL = "Awaiting Assignment: <br>";
const INACTIVE_LABEL = "Inactive: <br>";
const ON_BREAK_LABEL = "On Break: <br>";

// Major global vars
//var players = [[123,"Jon",1,0,0,234],[234,"Joey",1,0,0,345],[345,"Papi",1,0,0,456],[456,"Manny",1,0,0,123]];
var players = [[123,"Jon",0,0,0,0],[234,"Joey",0,0,0,0],[345,"Papi",0,0,0,0],[456,"Manny",0,0,0,0],[567,"Hangy",0,0,0,0],[678,"Sticky",0,0,0,0],[999,"Gretzky",0,0,0,0]];
var admins = [[111,"Japhet"],[222,"Viv"]];
var events = new Array; // log all events

var gameMode = MODE_ADMIN; // start in admin mode

//  global player vars, current and target
var currentPlayerIndex = 0;
var targetPlayerIndex = 0;

var lastEvent;
var lastMessage = "";  // screen element, text message area,

// global vars for buttons
var loginButton = document.getElementById("loginButton");
var logoffButton = document.getElementById("logoffButton");
var confirmBountyButton = document.getElementById("confirmBountyButton");
var reactivateButton = document.getElementById("reactivateButton");
var payBountiesButton = document.getElementById("payBountiesButton");
var addNewPlayerButton = document.getElementById("addNewPlayerButton");
var buyBackInButton = document.getElementById("buyBackInButton");
var takeABreakButton = document.getElementById("takeABreakButton");
var returnFromBreakButton = document.getElementById("returnFromBreakButton");
var startGameButton = document.getElementById("startGameButton");
var bombButton = document.getElementById("bombButton");


lastEvent = EVENT_TYPE_CREATE_GAME;
events.push([EVENT_TYPE_CREATE_GAME], new Date());
validateData();
renderGame();
console.log("Players array: " + players);

// -----  Begin Button Listener section --------

startGameButton.addEventListener('click', function(e)
{
  lastEvent = EVENT_TYPE_START_GAME;
  lastMessage = "Game Started at " + new Date();
  events.push([EVENT_TYPE_START_GAME], new Date());
  makeChain();
  renderGame();
});

// ----------------------------------------------

loginButton.addEventListener('click', function(e)
{
  var currentAdminIndex = findAdmin(document.getElementById("loginID").value);

  if (currentAdminIndex != PLAYER_NOT_FOUND)
  {
    gameMode = MODE_ADMIN;
    lastEvent = EVENT_TYPE_ADMIN_LOGIN;
    lastMessage = "Admin login successful at " + new Date();
    events.push([EVENT_TYPE_ADMIN_LOGIN, admins[currentAdminIndex][IND_ID], new Date()]);
    renderGame();
    return;
  }

  currentPlayerIndex = findPlayer(document.getElementById("loginID").value);

  if (currentPlayerIndex != PLAYER_NOT_FOUND)
  {
    gameMode = MODE_PLAYER;

    // determine target index
    targetPlayerIndex = findPlayer(players[currentPlayerIndex][IND_TARGET]);

    lastEvent = EVENT_TYPE_LOGIN;
    events.push([EVENT_TYPE_LOGIN, players[currentPlayerIndex][IND_ID],new Date()]);
    //players[currentPlayerIndex][IND_STATUS] = PLAYER_STATUS_ACTIVE;
    lastMessage = "Player logged in successfully at " + new Date();
    renderGame();
  }
  else
  {
    lastEvent = EVENT_TYPE_INCORRECT_LOGIN;
    lastMessage = "Unsuccessful login. " + document.getElementById("loginID").value + " not found at " + new Date();
    events.push([EVENT_TYPE_INCORRECT_LOGIN, document.getElementById("loginID").value, new Date()]);
    renderGame();
  }

}); // ---- end listener for login button  ------------

logoffButton.addEventListener('click', function(e)
{
  lastEvent = EVENT_TYPE_LOGOFF;
  events.push([EVENT_TYPE_LOGOFF, players[currentPlayerIndex][IND_ID], new Date()]);
  lastMessage = "";
  currentPlayerIndex=0;
  targetPlayerIndex=0;
  gameMode = MODE_ADMIN;
  renderGame();
});  // end logoff button listener

// -------------------------------------

buyBackInButton.addEventListener('click', function(e)
{
  lastEvent = EVENT_TYPE_BUY_BACK_IN;
  lastMessage = "Reactivate successful.  Awaiting assignment."
  events.push([EVENT_TYPE_BUY_BACK_IN, players[currentPlayerIndex][IND_ID], new Date()]);
  players[currentPlayerIndex][IND_OWED] = players[currentPlayerIndex][IND_OWED] - 1;
  players[currentPlayerIndex][IND_STATUS] = PLAYER_STATUS_WAITING;
  renderGame();
});  // end logoff button listener

// -------------------------------------

confirmBountyButton.addEventListener('click', function(e)
{
  // retrieve text from screen
  var targetsTarget = document.getElementById("targetsTarget");

  // retrieve the target's target's name from the players array
  var tempName = players[findPlayer(players[targetPlayerIndex][IND_TARGET])][IND_NAME];

  if (targetsTarget.value == tempName)
  {
    players[targetPlayerIndex][IND_STATUS]= PLAYER_STATUS_INACTIVE;
    players[currentPlayerIndex][IND_TOTAL]++;
    players[currentPlayerIndex][IND_OWED]++;
    lastEvent = EVENT_TYPE_CONFIRM_BOUNTY;
    lastMessage = "Successful bounty on " + players[targetPlayerIndex][IND_NAME] + " at " + new Date();
    events.push([EVENT_TYPE_CONFIRM_BOUNTY, players[currentPlayerIndex][IND_ID],players[targetPlayerIndex][IND_ID], new Date()]);
    makeChain();
    renderGame();
  }
  else
  {
    lastEvent = EVENT_TYPE_BOUNTY_FAILED;
    lastMessage = "Bounty failed. " + targetsTarget + " is incorrect at " + new Date();
    events.push([EVENT_TYPE_BOUNTY_FAILED, players[currentPlayerIndex][IND_ID],targetsTarget, new Date()]);
    renderGame();
  }

}); // end confirm bounty button listener

// -------------------------------------------------

reactivateButton.addEventListener('click', function(e)
{
  var tempIndex = findPlayer(document.getElementById("reactivateID").value);

  if ((tempIndex != PLAYER_NOT_FOUND) && (players[tempIndex][IND_STATUS] == PLAYER_STATUS_INACTIVE))
  {
    // Only if player found and inactive
    // console
    players[tempIndex][IND_STATUS] = PLAYER_STATUS_WAITING;
    players[tempIndex][IND_TARGET]= 0;
    lastEvent = EVENT_TYPE_REACTIVATE;
    lastMessage = "Reactive successful at " + new Date();
    events.push([EVENT_TYPE_REACTIVATE, document.getElementById("reactivateID").value, new Date()]);
    renderGame();
  }
  else
    {
      console.log ("Unsuccessful reactivate.");
      lastMessage = "Unsuccessful reactivate. " + document.getElementById("reactivateID").value + " not valid at " + new Date();
      lastEvent = EVENT_TYPE_REACTIVATE_FAILED;
      events.push([EVENT_TYPE_REACTIVATE_FAILED, document.getElementById("reactivateID").value, new Date()]);
      renderGame();
  }
}); // end reactivateButton function

// -------------------------------------------------

payBountiesButton.addEventListener('click', function(e)
{
  var tempIndex = findPlayer(document.getElementById("payBountyID").value);
  var tempBounties = document.getElementById("payBountiesNumber").value;

  if (tempBounties <= 0)
  {
    console.log ("Unsuccessful bounty pay - Invalid bounty number.");
    lastMessage = "Unsuccessful bounty pay - Invalid bounty number at " + new Date();
    lastEvent = EVENT_TYPE_PAY_BOUNTY_FAILED;
    events.push([EVENT_TYPE_PAY_BOUNTY_FAILED, document.getElementById("payBountyID").value, new Date()]);
    renderGame();
    return;
  }

  // check if valid player
  if (tempIndex == PLAYER_NOT_FOUND)
  {
    console.log ("Unsuccessful bounty pay - Player not found.");
    lastMessage = "Unsuccessful bounty pay - Player not found: " + document.getElementById("payBountyID").value + " at " + new Date();
    lastEvent = EVENT_TYPE_PAY_BOUNTY_FAILED;
    events.push([EVENT_TYPE_PAY_BOUNTY_FAILED, document.getElementById("payBountyID").value, new Date()]);
    renderGame();
    return;
  }

  if (players[tempIndex][IND_OWED] > 0)
  {
    if (tempBounties > players[tempIndex][IND_OWED])
    {
      players[tempIndex][IND_OWED] = 0;
    }
    else
    {
      players[tempIndex][IND_OWED] -= tempBounties;
    }
    console.log ("Successful bounty pay.");
    lastMessage = "Successful bounty pay.";
    lastEvent = EVENT_TYPE_PAY_BOUNTY;
    events.push([EVENT_TYPE_PAY_BOUNTY, document.getElementById("payBountyID").value, document.getElementById("payBountiesNumber").value, new Date()]);
    renderGame();
  }
  else {  // player not owed bounties

      console.log ("Unsuccessful bounty pay - Player not owed bounties.");
      lastMessage = "Unsuccessful bounty pay - Player not owed bounties: " + document.getElementById("payBountyID").value + " at " + new Date();
      lastEvent = EVENT_TYPE_PAY_BOUNTY_FAILED;
      events.push([EVENT_TYPE_PAY_BOUNTY_FAILED, document.getElementById("payBountyID").value, new Date()]);
      renderGame();
  }

}); // end function - pay bounties button

// -------------------------------------------------

addNewPlayerButton.addEventListener('click', function(e)
{
  var newID;
  var newPlayer;

  if (findPlayer(document.getElementById("newPlayerID").value) == PLAYER_NOT_FOUND)
  {
    players.push([document.getElementById("newPlayerID").value, document.getElementById("newPlayerName").value,0,0,0]);
    lastEvent = EVENT_TYPE_ADD_PLAYER;
    events.push([EVENT_TYPE_ADD_PLAYER, document.getElementById("newPlayerID").value, new Date()]);
    lastMessage = "Successfully added Player: " + document.getElementById("newPlayerID").value + " at " + new Date();
  }
  else // player id already exists
  {
    lastMessage = "Unsuccessfully added Player: " + document.getElementById("newPlayerID").value + ".  Player ID already exists at " + new Date();
    lastEvent = EVENT_TYPE_ADD_PLAYER_FAILED;
    events.push([EVENT_TYPE_ADD_PLAYER_FAILED, document.getElementById("loginID").value, new Date()]);
  }
  renderGame();

}); // end function

// -------------------------------------------------

bombButton.addEventListener('click', function(e)
{
  lastEvent = EVENT_TYPE_BOMB;
  lastMessage = "Bomb!!! at " + new Date();
  events.push([EVENT_TYPE_BOMB, new Date()]);
  makeChain();
  renderGame();
});  // end bomb button listener

// -------------------------------------------------

takeABreakButton.addEventListener('click', function(e)
{
  players[currentPlayerIndex][IND_STATUS] = PLAYER_STATUS_BREAK;
  lastEvent = EVENT_TYPE_TAKE_BREAK;
  lastMessage = "Successfully on break at " + new Date();
  events.push([EVENT_TYPE_TAKE_BREAK, players[currentPlayerIndex][IND_ID]]);
  makeChain();
  renderGame();
});  // takeABreakButton button listener

// -------------------------------------------------

returnFromBreakButton.addEventListener('click', function(e)
{
  lastEvent = EVENT_TYPE_RETURN_FROM_BREAK;
  events.push([EVENT_TYPE_RETURN_FROM_BREAK, players[currentPlayerIndex][IND_ID], new Date()]);
  lastMessage = "Return from break at " + new Date();
  players[currentPlayerIndex][IND_STATUS] = PLAYER_STATUS_WAITING;
  renderGame();  // don't make chain
});  // end returnFromBreakButton button listener

// ---------------------------------------------

function validateData()
{
  return true;
}

// -------------------------------------------------

function makeChain()
{
  var i;

  switch (gameMode) {

    case MODE_ADMIN:

      switch (lastEvent) {

        case EVENT_TYPE_START_GAME:

            shufflePlayers();

            // assign all players in chain and set to active
            for (i=0; i<players.length-1;i++)
            {
                if (players[[i][IND_STATUS] = PLAYER_STATUS_ACTIVE])
                players[i][IND_STATUS] = PLAYER_STATUS_ACTIVE;
                players[i][IND_TARGET] = players[i+1][IND_ID];
            } // for loop

            players[i][IND_STATUS] = PLAYER_STATUS_ACTIVE;
            players[i][IND_TARGET] = players[0][IND_ID];

          break;

        case EVENT_TYPE_BOMB:

            var i;
            var newCurr;
            var firstFound = PLAYER_NOT_FOUND;

            shufflePlayers();

            for (i=0;i<players.length;i++)
            {
              if ((players[i][IND_STATUS] == PLAYER_STATUS_WAITING) || (players[i][IND_STATUS] == PLAYER_STATUS_ACTIVE))
              {
                if (firstFound == PLAYER_NOT_FOUND)  // first match
                {
                  firstFound = i;
                  newCurr = i;
                  players[i][IND_STATUS] = PLAYER_STATUS_ACTIVE;
                }
                else // player match, but not the first
                {
                  players[newCurr][IND_TARGET] = players[i][IND_ID];
                  players[i][IND_STATUS] = PLAYER_STATUS_ACTIVE;
                  newCurr = i;
                }

              } // end if status match

            } // end for loop

            players[newCurr][IND_TARGET] = players[firstFound][IND_ID];

            break;

          // event types below are admin, but shouldn't require a makeChain call
          case EVENT_TYPE_LOGIN:

            // no action
            break;

          case EVENT_TYPE_INCORRECT_LOGIN:

            // no action
            break;

          case EVENT_TYPE_LOGOFF:

              // no action
              break;

          case EVENT_TYPE_REACTIVATE:

              // no action
              break;

          case EVENT_TYPE_REACTIVATE_FAILED:

              // no action
              break;

          case EVENT_TYPE_ADD_PLAYER:

              // no action
              break;

          case EVENT_TYPE_ADD_PLAYER_FAILED:

              // no action
              break;

        default:
            console.log ("Event should not have been triggered in Admin mode.")

      } // switch admin mode

      break;

    case MODE_PLAYER:

      switch (lastEvent) {

        case EVENT_TYPE_CONFIRM_BOUNTY:

            var getNext = getNextWaitingPlayer();

            if (getNext == PLAYER_NOT_FOUND)
            {
                // nobody waiting, simply update next target
                players[currentPlayerIndex][IND_TARGET] = players[targetPlayerIndex][IND_TARGET];
                targetPlayerIndex = findPlayer(players[currentPlayerIndex][IND_TARGET]);
            } // end if
            else  // player is waiting in the queue
            {
                // save target player's target
                var tempTargetsTarget = players[targetPlayerIndex][IND_TARGET];

                players[currentPlayerIndex][IND_TARGET] = players[getNext][IND_ID];
                targetPlayerIndex = getNext;

                players[targetPlayerIndex][IND_STATUS] = PLAYER_STATUS_ACTIVE;
                var newCurr = targetPlayerIndex;

                var i;  // loop from the first waiting to the end
                for (i=newCurr+1;i<players.length;i++)
                {
                  if (players[i][IND_STATUS] == PLAYER_STATUS_WAITING)
                  {
                    players[newCurr][IND_TARGET] = players[i][IND_ID];
                    players[i][IND_STATUS] = PLAYER_STATUS_ACTIVE;
                    newCurr = i;
                  }
                } // end for loop

                // save the target of the final person back to the original target's target
                players[newCurr][IND_TARGET] = tempTargetsTarget;

            } // end else player is waiting in the queue

            break;

        case EVENT_TYPE_TAKE_BREAK:

            var tempNextTarget = players[currentPlayerIndex][IND_TARGET];

            var i = 0;
            var whosHuntingMeFound = false;

            while ((whosHuntingMeFound == false) && (i<players.length))
            {
              if (players[i][IND_TARGET] == players[currentPlayerIndex][IND_ID])
              {
                players[i][IND_TARGET] = tempNextTarget;
                whosHuntingMeFound = true;
              }
              else {
                i++;
              }
            } // end while

            break;

        // events below are all valid player events, but shouldn't cause a makeChain call
        case EVENT_TYPE_LOGIN:

          // no action
          break;

        case EVENT_TYPE_INCORRECT_LOGIN:

            // no action
            break;

        case EVENT_TYPE_LOGOFF:

            // no action
            break;

        case EVENT_TYPE_BOUNTY_FAILED:

            // no action
            break;

        case EVENT_TYPE_BUY_BACK_IN:

            // no action
            break;

        case EVENT_TYPE_RETURN_FROM_BREAK:

            // no action
            break;

        default:

      } // end switch on last event in player mode

      break; // case player mode

    default:
      console.log ("Inconsistent game state.")

  }  // end switch game mode

} // end function make chain

// ----------------------------------------------------

function shufflePlayers()
{
  var i;

    for (i=0;i<players.length*50;i++)
    {
      var index1 = Math.floor((Math.random() * players.length));
      var index2 = Math.floor((Math.random() * players.length));
      var tempPlayer = players[index1];
      players[index1] = players[index2];
      players[index2] = tempPlayer;
    }
} // end shuffle players

// ---------------------------------------------------
function findPlayer(id)
{
  var foundPlayer = false;
  var i = 0;  // traverse players array

  while ((foundPlayer == false) && (i<players.length))
  {
    if (players[i][IND_ID] == id)
      foundPlayer = true;
    else
    {  i++; }
  } // end while loop

  if (foundPlayer == true)
  {
    return i;
  }
  else
  {
    return PLAYER_NOT_FOUND;
  }
} // end find player function

// ---------------------------------------------------

function findAdmin(id)
{
  var foundAdmin = false;
  var i = 0;  // traverse admins array

  while ((foundAdmin == false) && (i<admins.length))
  {
    if (admins[i][IND_ID] == id)
      foundAdmin = true;
    else
    {  i++; }
  } // end while loop

  if (foundAdmin == true)
  {
    return i;
  }
  else
  {
    return PLAYER_NOT_FOUND;
  }
} // end find admin function

// -------------------------------------------------

function getStatus(status)
{
  switch (status) {
    case PLAYER_STATUS_WAITING:
      return "Awaiting assignment"
      break;
    case PLAYER_STATUS_ACTIVE:
      return "Active";
      break;
    case PLAYER_STATUS_INACTIVE:
      return "Inactive";
      break
    case PLAYER_STATUS_BREAK:
      return "Break";
      break;
    default:
  } // end switch

} // end function get status ----------------------

function getNextWaitingPlayer()
{
  var i = 0;
  var found = false;

  while ((found == false) && (i<players.length))
  {
    if (players[i][IND_STATUS] == PLAYER_STATUS_WAITING)
      found = true;
    else {
        i++;
    }
  }
  if (found == true)
    return i;
  else
    return PLAYER_NOT_FOUND;

  } // end function get next waiting player

// ---------- Turn on - Turn off Functions ------------

function hidePlayerDashboard()
{
  var targetNameText = document.getElementById("targetNameText");
  targetNameText.style.visibility = "hidden";

  var targetName = document.getElementById("targetName");
  targetName.style.visibility = "hidden";

  var targetPicture = document.getElementById("targetPicture");
  targetPicture.style.visibility = "hidden";

  var targetsTargetText = document.getElementById("targetsTargetText");
  targetsTargetText.style.visibility = "hidden";

  var targetsTarget = document.getElementById("targetsTarget");
  targetsTarget.style.visibility = "hidden";

  var confirmBountyButton = document.getElementById("confirmBountyButton");
  confirmBountyButton.style.visibility = "hidden";

  var takeABreakButton = document.getElementById("takeABreakButton");
  takeABreakButton.style.visibility = "hidden";

  var returnFromBreakButton = document.getElementById("returnFromBreakButton");
  returnFromBreakButton.style.visibility = "hidden";

} // end function hide player dashboard

// --------------------------------------------

function showPlayerDashboard()
{
  var targetNameText = document.getElementById("targetNameText");
  targetNameText.style.visibility = "visible";

  var targetName = document.getElementById("targetName");
  targetName.style.visibility = "visible";
  targetName.innerHTML = players[findPlayer(players[currentPlayerIndex][IND_TARGET])][IND_NAME];

  var targetPicture = document.getElementById("targetPicture");
  var filename = "player" + players[currentPlayerIndex][IND_TARGET] + ".jpg";
  targetPicture.src = filename;
  targetPicture.style.visibility = "visible";

  var targetsTargetText = document.getElementById("targetsTargetText");
  targetsTargetText.style.visibility = "visible";

  var targetsTarget = document.getElementById("targetsTarget");
  targetsTarget.value = "";
  targetsTarget.style.visibility = "visible";

  var confirmBountyButton = document.getElementById("confirmBountyButton");
  confirmBountyButton.style.visibility = "visible";

  var takeABreakButton = document.getElementById("takeABreakButton");
  takeABreakButton.style.visibility = "visible";

} // end function show player dashboard

// -------------------------------------

function hideProfileData()
{
  var playerNameText = document.getElementById("playerNameText");
  playerNameText.style.visibility = "hidden";

  var playerName = document.getElementById("playerName");
  playerName.style.visibility = "hidden";

  var playerPicture = document.getElementById("playerPicture");
  playerPicture.style.visibility = "hidden";

  var playerStatusText = document.getElementById("playerStatusText");
  playerStatusText.style.visibility = "hidden";

  var playerStatus = document.getElementById("playerStatus");
  playerStatus.style.visibility = "hidden";

  var totalBountiesText = document.getElementById("totalBountiesText");
  totalBountiesText.style.visibility = "hidden";

  var totalBounties = document.getElementById("totalBounties");
  totalBounties.style.visibility = "hidden";

  var owedBountiesText = document.getElementById("owedBountiesText");
  owedBountiesText.style.visibility = "hidden";

  var owedBounties = document.getElementById("owedBounties");
  owedBounties.style.visibility = "hidden";

  var buyBackInButton = document.getElementById("buyBackInButton");
  buyBackInButton.style.visibility = "hidden";

} // end function hide profile data

function showProfileData()
{
  var playerNameText = document.getElementById("playerNameText");
  playerNameText.style.visibility = "visible";

  var playerName = document.getElementById("playerName");
  playerName.innerHTML = players[currentPlayerIndex][IND_NAME];
  playerName.style.visibility = "visible";

  var playerPicture = document.getElementById("playerPicture");
  var playerFilename = "player" + players[currentPlayerIndex][IND_ID] + ".jpg";
  playerPicture.src = playerFilename;
  playerPicture.style.visibility = "visible";

  var playerStatusText = document.getElementById("playerStatusText");
  playerStatusText.style.visibility = "visible";

  var playerStatus = document.getElementById("playerStatus");

  // update correct status
  playerStatus.innerHTML = getStatus(players[currentPlayerIndex][IND_STATUS]);
  playerStatus.style.visibility = "visible";

  var totalBountiesText = document.getElementById("totalBountiesText");
  totalBountiesText.style.visibility = "visible";

  var totalBounties = document.getElementById("totalBounties");
  totalBounties.innerHTML = players[currentPlayerIndex][IND_TOTAL];
  totalBounties.style.visibility = "visible";

  var owedBountiesText = document.getElementById("owedBountiesText");
  owedBountiesText.style.visibility = "visible";

  var owedBounties = document.getElementById("owedBounties");
  owedBounties.innerHTML = players[currentPlayerIndex][IND_OWED];
  owedBounties.style.visibility = "visible";

  if ((players[currentPlayerIndex][IND_STATUS] == PLAYER_STATUS_INACTIVE) && (players[currentPlayerIndex][IND_OWED] > 0))
  {
    var buyBackInButton = document.getElementById("buyBackInButton");
    buyBackInButton.style.visibility = "visible";
  }

} // end function showProfileData

// ---------------------------------------

function showLoginSection()
{
  // Show log in controls
  var loginIDText = document.getElementById("loginIDText");
  loginIDText.style.visibility = "visible";

  var loginID = document.getElementById("loginID");
  loginID.style.visibility = "visible";
  loginID.value = "";

  var loginButton = document.getElementById("loginButton");
  loginButton.style.visibility = "visible";
}

// ------------------------------------------

function hideLoginSection()
{
  // Hide log in controls
  var loginIDText = document.getElementById("loginIDText");
  loginIDText.style.visibility = "hidden";

  var loginID = document.getElementById("loginID");
  loginID.style.visibility = "hidden";
  loginID.value = "";

  var loginButton = document.getElementById("loginButton");
  loginButton.style.visibility = "hidden";
}

// ----------------------------------------------

function showAdminDashboard()
{
    // show admin fields
    document.getElementById("reactivateText").style.visibility = "visible";
    document.getElementById("reactivateID").style.visibility = "visible";
    document.getElementById("reactivateButton").style.visibility = "visible";

    document.getElementById("payBountyText").style.visibility = "visible";
    document.getElementById("payBountyID").style.visibility = "visible";
    document.getElementById("payBountiesNumberText").style.visibility = "visible";
    document.getElementById("payBountiesNumber").style.visibility = "visible";
    document.getElementById("payBountiesButton").style.visibility = "visible";

    document.getElementById("addNewPlayerNameText").style.visibility = "visible";
    document.getElementById("newPlayerID").style.visibility = "visible";
    document.getElementById("addNewPlayerIDText").style.visibility = "visible";
    document.getElementById("newPlayerName").style.visibility = "visible";
    document.getElementById("addNewPlayerButton").style.visibility = "visible";

    document.getElementById("activeChain").style.visibility = "visible";
    document.getElementById("awaitingAssignment").style.visibility = "visible";
    document.getElementById("inactive").style.visibility = "visible";
    document.getElementById("onBreak").style.visibility = "visible";

    document.getElementById("bombButton").style.visibility = "visible";
}

// ---------------------------------------------

function hideAdminDashboard()
{
    // hide admin fields
    document.getElementById("reactivateText").style.visibility = "hidden";
    document.getElementById("reactivateID").style.visibility = "hidden";
    document.getElementById("reactivateButton").style.visibility = "hidden";

    document.getElementById("payBountyText").style.visibility = "hidden";
    document.getElementById("payBountyID").style.visibility = "hidden";
    document.getElementById("payBountiesNumberText").style.visibility = "hidden";
    document.getElementById("payBountiesNumber").style.visibility = "hidden";
    document.getElementById("payBountiesButton").style.visibility = "hidden";

    document.getElementById("addNewPlayerNameText").style.visibility = "hidden";
    document.getElementById("newPlayerID").style.visibility = "hidden";
    document.getElementById("addNewPlayerIDText").style.visibility = "hidden";
    document.getElementById("newPlayerName").style.visibility = "hidden";
    document.getElementById("addNewPlayerButton").style.visibility = "hidden";

    document.getElementById("activeChain").style.visibility = "hidden";
    document.getElementById("awaitingAssignment").style.visibility = "hidden";
    document.getElementById("inactive").style.visibility = "hidden";
    document.getElementById("onBreak").style.visibility = "hidden";

    document.getElementById("bombButton").style.visibility = "hidden";
}

// -------------------------------------------------

function buildAndShowQueues()
{
    var tempChainMessage = "";
    var tempAwaitingMessage = "";
    var tempInactiveMessage = "";
    var tempOnBreakMessage = "";
    var i;

    for (i=0;i<players.length; i++)
    {
      switch (players[i][IND_STATUS])
      {
        case PLAYER_STATUS_ACTIVE:
            tempChainMessage += "Player " + players[i][IND_ID] + " - " + players[i][IND_NAME] + " targeting " + players[i][IND_TARGET] + "<br>";
          break;

        case PLAYER_STATUS_WAITING:
            tempAwaitingMessage += "Player " + players[i][IND_ID] + " awaiting assignment.<br>";
          break;

        case PLAYER_STATUS_INACTIVE:
              tempInactiveMessage += "Player " + players[i][IND_ID] + " inactive.<br>";
            break;

        case PLAYER_STATUS_BREAK:
              tempOnBreakMessage += "Player " + players[i][IND_ID] + " on break.<br>";
            break;

        default:
          // do nothing
      } // switch
    } // for loop

    document.getElementById("activeChain").innerHTML = ACTIVE_CHAIN_LABEL + tempChainMessage;
    document.getElementById("awaitingAssignment").innerHTML = AWAITING_ASSIGNMENT_LABEL + tempAwaitingMessage;
    document.getElementById("inactive").innerHTML = INACTIVE_LABEL + tempInactiveMessage;
    document.getElementById("onBreak").innerHTML = ON_BREAK_LABEL + tempOnBreakMessage;

    document.getElementById("activeChain").style.visibility = "visible";
    document.getElementById("awaitingAssignment").style.visibility = "visible";
    document.getElementById("inactive").style.visibility = "visible";
    document.getElementById("onBreak").style.visibility = "visible";
} // end function build and show queues

// -------------------------------------------------
function renderGame()
{

  switch (gameMode) {  // Outermost switch

    case MODE_ADMIN:

      switch (lastEvent) {   // switch last event within Admin mode

        case EVENT_TYPE_CREATE_GAME:

          console.log("Game Created.");
          showLoginSection();

          break;

        case EVENT_TYPE_START_GAME:

            console.log("Game Started.");
            document.getElementById("startGameButton").style.visibility = "hidden";
            buildAndShowQueues();  // show all players by status

            break;

        case EVENT_TYPE_ADMIN_LOGIN:

            console.log("Admin mode, logged in successfully.");
            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
            document.getElementById("lastMessage").style.visibility = "visible";

            hideLoginSection();
            // show logoff and Game Start buttons
            document.getElementById("logoffButton").style.visibility = "visible";
            document.getElementById("startGameButton").style.visibility = "visible";

            buildAndShowQueues();  // show all players by status
            showAdminDashboard();

            break;

        case EVENT_TYPE_INCORRECT_LOGIN:

            console.log("Logged in unsuccessfully ID is " + document.getElementById("loginID").value);
            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
            document.getElementById("loginID").value = "";

            break;

        case EVENT_TYPE_LOGOFF:

            console.log ("Successful logoff.");
            document.getElementById("lastMessage").innerHTML = "";
            document.getElementById("lastMessage").style.visibility = "hidden";
            document.getElementById("logoffButton").style.visibility = "hidden";

            hideAdminDashboard();
            hidePlayerDashboard();
            document.getElementById("returnFromBreakButton").style.visibility = "hidden";
            hideProfileData();

            showLoginSection();

            break;

        case EVENT_TYPE_REACTIVATE:

            console.log ("Successful reactivate.");
            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;

            document.getElementById("reactivateID").value = "";

            buildAndShowQueues();

            break;

        case EVENT_TYPE_REACTIVATE_FAILED:

            console.log ("Unsuccessful reactivate.");
            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
            document.getElementById("reactivateID").value = "";

            break;

        case EVENT_TYPE_ADD_PLAYER:

            console.log ("Successful add player.");
            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;

            buildAndShowQueues();

            break;

        case EVENT_TYPE_ADD_PLAYER_FAILED:

            console.log ("Unsuccessful add player.");
            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
            document.getElementById("newPlayerID").value = "";

            break;

        case EVENT_TYPE_BOMB:

            console.log ("Bomb dropped at " + new Date());
            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
            buildAndShowQueues();

            break;

        case EVENT_TYPE_PAY_BOUNTY:

            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
            document.getElementById("payBountyID").value = "";
            document.getElementById("payBountiesNumber").value = "";
            break;

        default:

      } // switch admin mode - last event

      break;

    case MODE_PLAYER:

      switch (lastEvent) {  // switch on last Event in Player

        case EVENT_TYPE_LOGIN:

          console.log ("Successful login.");
          document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
          document.getElementById("lastMessage").style.visibility = "visible";

          hideLoginSection();
          document.getElementById("logoffButton").style.visibility = "visible";

          if (players[currentPlayerIndex][IND_STATUS] == PLAYER_STATUS_ACTIVE)
          {
            showPlayerDashboard();
          }

          if (players[currentPlayerIndex][IND_STATUS] == PLAYER_STATUS_BREAK)
          {
            document.getElementById("returnFromBreakButton").style.visibility = "visible";
          }

          showProfileData();

          break;

        // Shouldn't get here, already back in admin mode
        case EVENT_TYPE_INCORRECT_LOGIN:

            break;

        // Shouldn't get here, already back in admin mode
        case EVENT_TYPE_LOGOFF:

            break;

        case EVENT_TYPE_CONFIRM_BOUNTY:

            console.log ("Successful bounty.");
            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
            document.getElementById("targetsTarget").value = "";

            showPlayerDashboard();
            showProfileData();

            break;

        case EVENT_TYPE_BOUNTY_FAILED:

            console.log ("Unsuccessful bounty.");
            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
            document.getElementById("targetsTarget").value = "";

            break;

        case EVENT_TYPE_BUY_BACK_IN:

            console.log ("Successful buy back in.");
            document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;

            document.getElementById("playerStatus").innerHTML = getStatus(players[currentPlayerIndex][IND_STATUS]);
            document.getElementById("owedBounties").innerHTML = players[currentPlayerIndex][IND_OWED];
            document.getElementById("buyBackInButton").style.visibility = "hidden";

            break;

        case EVENT_TYPE_TAKE_BREAK:

          document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
          hidePlayerDashboard();
          document.getElementById("playerStatus").innerHTML = getStatus(PLAYER_STATUS_BREAK);
          document.getElementById("returnFromBreakButton").style.visibility = "visible";

          break;

        case EVENT_TYPE_RETURN_FROM_BREAK:

          document.getElementById("lastMessage").innerHTML = LAST_MESSAGE_TEXT + lastMessage;
          document.getElementById("playerStatus").innerHTML = getStatus(PLAYER_STATUS_WAITING);
          document.getElementById("returnFromBreakButton").style.visibility = "hidden";

          // show logoff button
          document.getElementById("logoffButton").style.visibility = "visible";

          break;

        default:

      } // end switch on last event in player mode

      break; // case player mode

    default:
      console.log ("Inconsistent game state.")

  } // outermost switch statement on game mode

  // always blank out admin input fields
  document.getElementById("reactivateID").value = "";
  document.getElementById("newPlayerID").value = "";
  document.getElementById("newPlayerName").value = "";

  // take this out eventually
  buildAndShowQueues();

} // end function renderGame
