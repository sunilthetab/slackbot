/* Please make the files first at the TOKEN_PATH:
1. usersData.json
Content: The authorization tokens of all users.
Syntax: {'users':{
          'userName':{
              tokenDetails
            }
          }
        }

2. meetings.json
Syntax: {'meetings':{
          'meetingID':{
            'users': 'user1, user2, ...';

            'summary': 'meeting Agenda';
            'startDateTime': 'dateTime';
            'duration': 'HH:MM';
            'admin':'meeting organizer';
            }
          }
        }

*/

var _ = require('underscore');
var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
var moment = require('moment');

var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    //process.env.USERPROFILE) + '/.credentials/';
     process.env.USERPROFILE) + '/Azra_MeetingBot/Milestone_3_Practise/';
var TOKEN_PATH = TOKEN_DIR + 'store.json';

var MEETING_PATH = TOKEN_DIR + 'meetings.json';
var eventsHelper = require('./events.js');
var NewEvent = {};
var primaryUserAuth ="";
var NewEventID = '';

// SET PRIMARY USER AUTH TOKEN
SetPrimaryUserAuth('ppfirake');
var meet = require(MEETING_PATH);
var obj=[];
var MeetingDuration = 0;


// Load client secrets from a local file.
function getEventsOf(user){
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API.
  authorize(JSON.parse(content), user, listEvents);
});
}

function eventIDstore(eventID)
{
        NewEventID = eventID;
 console.log("********************************************************");
 console.log("received NewEventID in bot.js %s", NewEventID );
 console.log("********************************************************");

        var keys=Object.keys(meet["meetings"]);

        var last=keys[keys.length-1];
        last++;
        meetingID=last;
        //console.log(last+ "sfdfffssssssss");
        
        meet["meetings"][last]= NewEventID + "|" + NewEvent['summary'];
        

        fs = require('fs');
        var m = JSON.parse(fs.readFileSync('./meetings.json').toString());
        fs.writeFile('./meetings.json', JSON.stringify(meet));
}

 function event_insert(auth, event,callback) {
        calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
        }, function (err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            console.log('Event created: %s', event.htmlLink);


            console.log('Event ID: %s', event.id);

            callback(event.id);

        });
        
}

function SetPrimaryUserAuth(user)
{
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API.
  var credentials = JSON.parse(content);
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var gAuth = new googleAuth();
  var oauth2Client = new gAuth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, fileData) {
    if (err) {

    } else {
      var allData = JSON.parse(fileData);
      if(!allData.users.hasOwnProperty(user)){
        getNewToken(oauth2Client, user, callback);
      }else{
        oauth2Client.credentials = allData.users[user];
        primaryUserAuth = oauth2Client;
      }
    }
  });
});
}



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, user, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, fileData) {
    if (err) {

    } else {
      var allData = JSON.parse(fileData);
      if(!allData.users.hasOwnProperty(user)){
        getNewToken(oauth2Client, user, callback);
      }else{
        oauth2Client.credentials = allData.users[user];
        callback(oauth2Client, user);
      }
    }
  });
}


function listEvents(auth, user) {
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found for user: ' + user + '.');
    } else {
      console.log('Upcoming 10 events of ' + user + ':');
      var count=events.length;
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        var end= event.end.dateTime || event.end.date;
        console.log('EVENT::::\n%s - %s - %s', start, event.summary,end);
      }
      storeCal(user, start, end, events, count);
    }
  });
  console.log();
}


var Botkit = require('botkit');

var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
  token: process.env.ALTCODETOKEN,
  
  //slack bot token here
}).startRTM()



var config = require(TOKEN_PATH);
var meetingsData = require(MEETING_PATH);

//coversation to schedule new meeting begins here
controller.hears(['^schedule$', '^setup$'],['mention', 'direct_mention'], function(bot,message) {

  // Asks the users and stores.
  var approxMeetingDuration_Hours = 0;
  var approxMeetingDuration_Mins = 0;

  //Contains all email ids
  var users;

  // New meeting details that Azra calculates.
  var newMeetingStartHour;
  var newMeetingStartMinute;
  var newMeetingStartDay;
  var newMeetingStartMonth;
  var newMeetingStartYear;

  // flags to check whether there is any maximum period for meeting to be scheduled.
  var constraintOnDay = true;
  var constraintOnTime = true;

  // Maximum Time by which new Meeting should be organized.
  var byTime_Hour;
  var byTime_Minute;
  var byDate;
  var byMonth;
  var byYear;

  // Agenda of the new Meeting.
  var meetingGoal;

  //
  var meetinghh;
  var meetingmm;
  var meetingday;

  //
  var daythis;
  var mdaythis;
  var meetingID;
  var slots;
  var roomid;
  var meetingslot;
  var slotpassed;

  // Gets all the ids. If any is invalid, asks again. If succesfull, azra asks about approximate meeting duration.
  var getIDOfAttendees = function(err, convo){
    convo.ask('Alright. May I know the email IDs of the attendees, please?',function(response,convo) {
      var IDofAttendees = response.text;

      // testing
      // storeDetailsOf('gautam94verma');

      users = IDofAttendees.split(" ");
      if(IDofAttendees.indexOf(',') > -1){
        users = IDofAttendees.split(",");
      }

      var email = {};
      var emails = [];

      for(var i = 0 ; i < users.length ; i++){
        users[i] = users[i].trim();
        var user = users[i];
        if(!config["users"].hasOwnProperty(user)){
           convo.say('Employee ' + user +' is not a member of this team. Please limit to the members only and try again.');
           getIDOfAttendees(response, convo);
           convo.next();
           return;
         }
         if(user.indexOf('@') > 0) {
           email['email'] = user;
         }
         else {
          email['email'] = user + '@ncsu.edu';
          console.log("printing the email id of attendees");
          console.log(email['email']);
        }
          emails.push(email);
      }
      NewEvent['attendees'] = emails;
     

      getApproxMeetingDuration(response, convo);
      convo.next();
    });
  };

  // Asks the user about the new meeting Duration.
  var getApproxMeetingDuration = function(err, convo){
    convo.ask('OK. What will be the approximate duration of the meeting (HH:MM or HH)?',function(response,convo) {
      var approxMeetingDuration = response.text;

      approxdur = approxMeetingDuration;

      var approxDurationArray = [];
      approxDurationArray[0] = approxMeetingDuration;
      if(approxMeetingDuration.indexOf(":") > -1){
        approxDurationArray = approxMeetingDuration.split(":");
      }

      approxMeetingDuration_Hours = parseInt(approxDurationArray[0]);
      if(approxDurationArray.length == 2){
        approxMeetingDuration_Mins = parseInt(approxDurationArray[1]);
      }

      approxMeetingDuration = approxMeetingDuration_Hours + approxMeetingDuration_Mins/60;

      // maximum valid meeting duration can be 3 hours.
      if(approxMeetingDuration > 0 && approxMeetingDuration<3)
      {
        MeetingDuration = approxMeetingDuration;

        getLastDateOrDay(response, convo);
        convo.next();
      }
      else
      {
        convo.say('Meeting can not be schedule for more than 3 hrs! Please try again');
        getApproxMeetingDuration(response, convo);
        convo.next();
      }
    });
  };

  // Asks the user about the date/day by which meeting should be scheduled.
  var getLastDateOrDay = function(err, convo){
    convo.ask('And by what date(MM/DD/YYYY or MM/DD or DD) or day do you want the meeting to be scheduled? Say NA if no such constraint',function(response,convo) {
      // If there is no such constraint.
      if(response.text=='na'||response.text=='Na'||response.text=='NA')
      {
        constraintOnDay=false;
      }else{
        lastDate = response.text;

        //today's date and time
        var today = new Date();

        //user's specified date
        var dateArray = lastDate.split(" ");
        if(lastDate.indexOf("/") > -1)
          dateArray = lastDate.split("/");

        byDate = today.getDate();
        byMonth = today.getMonth();
        byYear = today.getYear();

        if(dateArray[0].match(/[0-9]+/)){//It's a number
          if(dateArray.length == 1){
            byDate = parseInt(dateArray[0]);
            if(byDate < today.getDate()){
              convo.say("I can't organize a meeting in the past! Please try again.");
              getLastDateOrDay(response, convo);
              convo.next();
              return;
            }
          }else if(dateArray.length == 2){
            byDate = parseInt(dateArray[1]);
            byMonth = parseInt(dateArray[0]);
            if(byMonth < today.getMonth() || byDate < today.getDate()){
              convo.say("I can't organize a meeting in the past! Please try again.");
              getLastDateOrDay(response, convo);
              convo.next();
              return;
            }
          }else{
            byDate = parseInt(dateArray[1]);
            byMonth = parseInt(dateArray[0]);
            byYear = parseInt(dateArray[2]) - 1900;
            if(byYear < today.getYear() || (byYear === today.getYear() && (byMonth < today.getMonth()) || (byYear === today.getYear() && byMonth === today.getMonth() && byDate < today.getDay()))){
              convo.say("I can't organize a meeting in the past! Please try again.");
              getLastDateOrDay(response, convo);
              convo.next();
              return;
            }
          }
          // convo.say("i got " + byDay + " " + byMonth + " " + byYear);
        }else if(dateArray[0].toUpperCase() === "SUNDAY"){
          byDate += today.getDay() > 0 ? 7 - today.getDay() : 7;
        }else if(dateArray[0].toUpperCase() === "MONDAY"){
          byDate += today.getDay() >= 1 ? 7 - today.getDay() + 1: 1 - today.getDay();
        }else if(dateArray[0].toUpperCase() === "TUESDAY"){
          byDate += today.getDay() >= 2 ? 7 - today.getDay() + 2: 2 - today.getDay();
        }else if(dateArray[0].toUpperCase() === "WEDNESDAY"){
          byDate += today.getDay() >= 3 ? 7 - today.getDay() + 3: 3 - today.getDay();
        }else if(dateArray[0].toUpperCase() === "THURSDAY"){
          byDate += today.getDay() >= 4 ? 7 - today.getDay() + 4: 4 - today.getDay();
        }else if(dateArray[0].toUpperCase() === "FRIDAY"){
          byDate += today.getDay() >= 5 ? 7 - today.getDay() + 5: 5 - today.getDay();
        }else if(dateArray[0].toUpperCase() === "SATURDAY"){
          byDate += today.getDay() >= 6 ? 7 - today.getDay() + 6: 6 - today.getDay();
        }else if(dateArray[0].toUpperCase() === "TODAY"){
          byDate = today.getDate();
        }else if(dateArray[0].toUpperCase() === "TOMORROW"){
          byDate = today.getDate() + 1;
        }

        if(byMonth === 1 || byMonth ===  3 || byMonth === 5 || byMonth === 8 || byMonth === 10){
          if(byMonth === 1){
            if(today.getYear() % 4 === 0 && byDate > 28){
              byDate -= 28;
              byMonth++;
            }else if(today.getYear() % 4 !== 0 && byDate > 29){
              byDate -= 29;
              byMonth++;
            }
          }else{
            if(byDate > 30){
              byDate -= 30;
              byMonth++;
            }
          }
        }else if(byMonth === 0 || byMonth === 2 || byMonth === 4 || byMonth === 7 || byMonth === 9){
          if(byDate > 31){
            byDate -= 31;
            byMonth++;
          }
        }else{
          if(byDate > 31){
            byDate -= 31;
            byMonth = 1;
            byYear++;
          }
        }
      }

      var start = {};
      var end = {};

      start['dateTime'] = "2016-11-"+ byDate+"T12:00:00-07:00";
      //start['dateTime'] = "2016-12-"+ byDate + "T15:00:00-07:00";
      NewEvent['start'] = start;
      //sdate = byDate;
      //var dn = moment(start.toISOString).format();



      // TODO: get end time by => endtime = starttime + meetingDuration;
      end['dateTime'] = "2016-11-"+ byDate+"T13:00:00-07:00";

      NewEvent['end'] = end;

      getLastTime(response, convo);

      convo.next();
    });
  };

  // Asks the user whether ther is any time by which the meeting should be organized.
  var getLastTime = function(err, convo){
    convo.ask('OK. By what time (HH:MM or HH) should the meeting be organized (24 Hour format)? Say NA if no such constraint',function(response,convo) {
      if(response.text.toUpperCase='NA')
      {
        constraintOnTime=false;
      }else{

        lastTime = response.text;

        /*etime = lastTime;

        console.log("********************************");
        console.log("etime = lastTime" + etime + lastTime); */

        //today's date and time
        var today = new Date();
        //user's specified date
        var timeArray = lastTime.split(" ");
        if(lastTime.indexOf(":") > -1)
          timeArray = lastTime.split(":");

        byTime_Hour = parseInt(timeArray[0]);
        //approxdur = parseInt(approxMeetingDuration);

        /*var bytimeh = lastTime +approxMeetingDuration;

        console.log("bytimeh"+bytimeh);


        start['dateTime'] += "T"+byTime_Hour+":00:00-07:00";

        //console.log(start);

        NewEvent['start'] = start;
        end['dateTime'] += "T"+bytimeh+":00:00-07:00"; 
        

        NewEvent['end'] = end; */

        

        byTime_Minute = 0;

        if(timeArray.length == 2)
          byTime_Minute = parseInt(timeArray[1]);

        if(byDate === today.getDate() || byDate === today.getDate() + 1){

          var meetingDurationInMin = approxMeetingDuration_Hours * 60 + approxMeetingDuration_Mins;

          var timeLeftInMin = (new Date(1900 + byYear, byMonth, byDate, byTime_Hour, byTime_Minute, 0, 0) - new Date()) / (1000 * 60);
          // console.log(new Date(1900 + byYear, byMonth, byDate, byTime_Hour, byTime_Minute, 0, 0));
          // console.log(new Date());
          // convo.say("Time Left: " + timeLeftInMin);

          // If there is no sufficient time, ask the user to give the details again. Hadnled in HandleInsufficientTime.
          if(timeLeftInMin < meetingDurationInMin){
            HandleInsufficientTime(response, convo);
            convo.next();
            return;
          }
        }
      }

// TODO: Get primary user name, ie if I am scheduling the meeting I am the primary user. The code has to
// know that I am creating meeting and only my auth tokens are to be used to create the meeting





      // Initialized just for testing.
      newMeetingStartDay = 13;
      newMeetingStartHour = 2;
      newMeetingStartYear = 2016;
      newMeetingStartMonth = 11;
      newMeetingStartMinute = 0;


      getAgenda(response, convo);

      //convo.say("i got day" + " " + meetingday + " at " + meetinghour+ " and  " + meetingmin+" mins");

      //var meeting = OrganizeOptimalMeeting();

      //convo.say("Your meeting details are as follow: " + meeting);

      convo.next();

    });
  };

  var getAgenda = function(err, convo){
    convo.ask('What is the goal of this meeting?',function(response,convo) {
      meetingGoal = response.text;
      NewEvent['summary'] = response.text;
      fixMeeting(response, convo);
      convo.next();
    });
  };

  var fixMeeting = function(err, convo){
    convo.ask('Do you want to fix this meeting time? Please reply Yes or No',function(response,convo) {
      var answer = response.text;
      if((answer==='no')||(answer==='No')||(answer==='NO')){
        // bot.startConversation(message, getLastTime);
        bot.reply(message, 'The meeting was NOT organized. Thank you for using Azra.');
        convo.next();
      }else{
        bot.reply(message, 'meeting is confirmed');

        // Azra will store the meeting details in the file meetings.json at MEETING_PATH.
        /*var allMeetingKeys = Object.keys(meetingsData["meetings"]);
        var newMeetingID = -1;
        if(allMeetingKeys.length > 0)
          newMeetingID = allMeetingKeys[allMeetingKeys.length - 1];
        newMeetingID++;
        meetingID = newMeetingID;

        //sets meeting ID based on incrementing most recent meeting ID from JSON
        bot.reply(message, 'This is your meeting ID : ' + newMeetingID);

        var usersInMeeting = users[0];

        for(var i = 1 ; i < users.length ; i++)
          usersInMeeting += ', ' + users[i];

        meetingsData["meetings"][newMeetingID] = {};
        meetingsData["meetings"][newMeetingID]["users"] = usersInMeeting;
        meetingsData["meetings"][newMeetingID]["summary"] = meetingGoal;
        meetingsData["meetings"][newMeetingID]["startDateTime"] = new Date(newMeetingStartYear, newMeetingStartMonth, newMeetingStartDay, newMeetingStartHour, newMeetingStartMinute, 0, 0);
        meetingsData["meetings"][newMeetingID]["duration"] = approxMeetingDuration_Hours + ':' + approxMeetingDuration_Mins;
        meetingsData["meetings"][newMeetingID]["admin"] = message.user;

        fs.writeFile(MEETING_PATH, JSON.stringify(meetingsData)); // asynchronous write. */

        /*Call event.js functions*/
        //get auth from somewhere and put below
        //eventsHelper.event_insert(primaryUserAuth, NewEvent, eventIDstore);

        //start['dateTime'] = "2016-12-"+ byDate+"T15:00:00-07:00";



      /*start['dateTime'] = "2016-12-"+ sdate + "T"+etime+":00:00-07:00";
      NewEvent['start'] = start;
      var endtimeK = parseInt(etime) + parseInt(approxdur);
      var etime2 = endtimeK.toString();


      end['dateTime'] = "2016-12-"+ sdate + "T"+etime2+":00:00-07:00";

      NewEvent['end']= end; */

        event_insert(primaryUserAuth, NewEvent, eventIDstore);
        




        


// Add to the calendar of all users.
//////////////////////// WRITE THE CODE
        // var i;
        // var j;
        // //set meeting ID to calendar
        // for(i=0;i<users.length;i++){
        //   var username=users[i];
        //   for(j=meetingslot;j<(meetingslot+duration);j++) {
        //     // config["users"][username][meetingday][j]=meetingID;
        //     //console.log("value is : "+config["users"][username][meetingday][j]);
        //   }
        // }
      }
//////////////////////////////////
      convo.next();
    });
  };

  var calculateCommonTime=function(users,daythis,slotthis,slots){
    if (slotthis == 15 || ((slotthis + slots) >= 16)) {
      var dayhere = daythis.split("-");
      yyyy = dayhere[0];
      dd = dayhere[1];
        dd=(parseInt(dd)+1).toString();
      mm = dayhere[2];
      if ((dd == '32') || ((dd == '31') && ((mm == '02') || (mm == '06') || (mm == '09') || (mm == '11'))) || ((dd = '29') && (mm == '02'))) {
        dd = 1;
        mm = mm + 1;
        if (mm = 13) {
          mm = 1;
          yyyy = yyyy + 1;
        }
      }
      slotthis = 0;
      daythis = yyyy + '-' + dd + '-' + mm;
    }
    var slotpassed=calculateFreeTime(users[0],daythis,slotthis,slots);
    while(slotpassed<0) {
      slotthis = slotthis + 1;
      if (slotthis == 15 || ((slotthis + slots) >= 16)) {
        var dayhere = daythis.split("-");
        yyyy = dayhere[0];
        dd = dayhere[1];
          dd=(parseInt(dd)+1).toString();
        mm = dayhere[2];
        if ((dd == '32') || ((dd == '31') && ((mm == '02') || (mm == '06') || (mm == '09') || (mm == '11'))) || ((dd = '29') && (mm == '02'))) {
          dd = 1;
          mm = mm + 1;
          if (mm = 13) {
            mm = 1;
            yyyy = yyyy + 1;
          }
        }
        slotthis = 0;
        daythis = yyyy + '-' + dd + '-' + mm;
      }
      slotpassed = calculateFreeTime(users[0], daythis, slotthis, slots);
    }
    var check=checkforthistime(users,daythis,slotpassed,slots);
    if(check>=0){
        mdaythis=daythis;
      return slotpassed;
    }
    else{
      slotthis=slotthis+1;
      calculateCommonTime(users,daythis,slotthis,slots);
    }


  }
  var calculateFreeTime = function(username,daythis,slotthis,slots){
    var count=0;
    var basepos=slotthis;
    var i;
    var data;

    for(i=slotthis;i<16-slots;i++)
    {
      if(count==slots){
        break;
      }
      data = JSON.parse(JSON.stringify(config["users"][username][daythis][i]));
      if(parseInt(data)==0){
        count++;
      }else{
        count=0;
      }

    }
    if(count==slots){

      return (i-slots);
    }else return -1;

  }

  var checkforthistime=function(users,daythis,slotpassed,slots){
    var check=true;
    var i;
    var k;
    var slottocheck;
    for(k=0;k<(users.length-1);k++) {
      slottocheck=slotpassed;
      for (i = 0; i < slots; i++) {
        var username = users[k + 1];
        data = JSON.parse(JSON.stringify(config["users"][username][daythis][slottocheck]));
        if (parseInt(data) == 0) {
          slottocheck++;

        } else {
          check=false;
          break;
        }
      }
      if(check==false){
        break;
      }
    }
    if(check==true){
      return 1;
    }else return -1;
  }

  var HandleInsufficientTime = function(err, convo){
    convo.ask("Not enough time! Please select one of the two choices: \n1. Enter new Date\n2. Enter new time.",function(response,convo) {
      var choice = response.text;

      if(choice === '1'){
        getLastDateOrDay(response, convo);
      }else if(choice === '2'){
        getLastTime(response, convo);
      }else {
        convo.say("Incorrect value. Please try again.");
        HandleInsufficientTime(response, convo);
      }

      convo.next();
      return;
    });
  };

  var OrganizeOptimalMeeting = function(){

  }

  // start a conversation with the user.
  bot.startConversation(message, getIDOfAttendees);

  bot.reply(message, "Let us organize a new meeting.");

});

//coversation to add new member to a meeting
controller.hears(['^Add$', '^new$'],['mention', 'direct_mention'], function(bot,message) {
  var newAttendeeIDs;
  var attendeesString = "";
  var meetingID;

  var getIDOfNewAttendee = function(err, convo){
    convo.ask('May I know the email IDs of the new attendees, please?',function(response,convo) {
      
      attendeesString = response.text;
      newAttendeeIDs = attendeesString.split(" ");
      
      if(response.text.indexOf(",") > -1){
        newAttendeeIDs = response.text.split(",");
      }

      getIDOfMeeting(response, convo);

      convo.next();
    })
  };

  var getIDOfMeeting = function(err, convo){
    var keys=Object.keys(meet["meetings"]);
        
        //var last=keys[keys.length-1];
        console.log("here are the events");
        console.log(keys);
        convo.say("these are the meeting details preceding with IDs");

      for(var i=0;i<keys.length; i++)
      {
        convo.say(keys[i]+" "+meet["meetings"][keys[i]].split('|')[1]);
      }



    convo.ask('Alright. What is the meeting ID?',function(response,convo) {

      //meetingID = parseInt(response.text);
      //var eventID = "somehardcodestring";

      var meetingID1 = response.text;
      console.log("somehardcodestring");
      console.log("wtf %s", NewEventID);

      var editevent = meet["meetings"][meetingID1].split("|");


      eventsHelper.event_patch_add_users(primaryUserAuth, editevent[0], attendeesString)


      //adjustMeeting();

      //var meeting = config["meetings"][meetingID].split("|");
      convo.say("Members Added");
      //var display = "Preview: Meeting ID "+ meetingID +" & List of members: " + meeting[2];
      //convo.say(display);
      convo.next();
    })
  };

  var adjustMeeting = function()
  {
    var meeting = config["meetings"][meetingID].split("|");
    for(var i = 0 ; i < meeting.length ; i++)
    {
      meeting[i] = meeting[i].trim();
    }

    //var meetingday = meeting[0];
    var meetingAttendees = meeting[2].split(",");
    //var meetingslot = meeting[3];
    //var duration = meeting[4];

    var notAlreadyExistingAttendeeIDs= [];

    for (var i=0, iLen=newAttendeeIDs.length; i < iLen; i++)
    {
      if(meetingAttendees.indexOf(newAttendeeIDs[i])==-1)
      {
        meetingAttendees.push(newAttendeeIDs[i]);
        notAlreadyExistingAttendeeIDs.push(newAttendeeIDs[i]);
      }
    }

    config["meetings"][meetingID]=meeting[0]+"|"+meeting[1]+ "|" +meetingAttendees+"|" + meeting[3] +"|"+ meeting[4];

    for(var i=0;i<notAlreadyExistingAttendeeIDs.length;i++)
    {
      var username = notAlreadyExistingAttendeeIDs[i];
      for(var j=meeting[3];j<(meeting[3]+meeting[4]);j++)
      {
        config["users"][username][meeting[0]][j]=meetingID;
      }
    }

    fs = require('fs');
    var m = JSON.parse(fs.readFileSync('./mock.json').toString());
    fs.writeFile('./mock.json', JSON.stringify(config));


  };

  // start a conversation with the user.
  bot.startConversation(message, getIDOfNewAttendee);

  bot.reply(message, "Let us add the new member to the meeting.");
});

//coversation to remove a member from meeting
controller.hears(['^remove$'],['mention', 'direct_mention'], function(bot,message) {

  var userRequestingRemoval = message.user;

  var IDOfAttendeesToRemove;
  var meetingID;

  var getIDOfAttendeeToRemove = function(err, convo){
    convo.ask('May I know the email ID of the attendee, please?',function(response,convo) {
      attendeesString = response.text;
      IDOfAttendeesToRemove = response.text.split(' ');

      getIDOfMeeting(response, convo);

      convo.next();
    })
  };

  var getIDOfMeeting = function(err, convo){

      var keys=Object.keys(meet["meetings"]);
        
        //var last=keys[keys.length-1];
        console.log("here are the events");
        console.log(keys);
        convo.say("these are the meeting details preceding with IDs");

      for(var i=0;i<keys.length; i++)
      {
        var meet1 = meet["meetings"][keys[i]].split('|');
        //convo.say(meet1[0]);
        //convo.say(meet1[1]);
        var prinhim = keys[i]+" "+meet1[1];
        console.log("*******************&&&&&&");
        console.log(prinhim);
        //convo.say(prinhim);
      }
    convo.ask('Alright. What is the meeting ID?',function(response,convo) {

      meetingID = parseInt(response.text) ;

      // if(userRequestingRemoval in meeting.getUsers()) //Some type of validaion required here.
      confirmRemoval(response, convo);
      // else
      // convo.say("You are not authorized for this action.");

      convo.next();
    })
  };

  var confirmRemoval = function(err, convo){
    convo.ask('Are you sure you want to remove the member from the meeting?',function(response,convo) {
      var confirmation = response.text;

      if(confirmation.toUpperCase() === "YES"){
        removeMembersFromMeeting();
        var meeting = config["meetings"][meetingID].split("|");
        convo.say("Members removed.");
        var display = "Preview: Meeting ID "+ meetingID +" & List of members: " + meeting[2];
        convo.say(display);
      }else{
        convo.say("Members NOT removed.");
      }
      convo.next();
    })
  };

  var removeMembersFromMeeting = function() {
    var meeting = config["meetings"][meetingID].split("|");
    for (var i = 0; i < meeting.length; i++) {
      meeting[i] = meeting[i].trim();
    }

    //var meetingday = meeting[0];
    var meetingAttendees = meeting[2].split(",");
    //var meetingslot = meeting[3];
    //var duration = meeting[4];

    var actualRemovedAttendees = [];

    for (var i = 0, iLen = IDOfAttendeesToRemove.length; i < iLen; i++) {
      if (meetingAttendees.indexOf(IDOfAttendeesToRemove[i]) != -1) {
        meetingAttendees.splice(meetingAttendees.indexOf(IDOfAttendeesToRemove[i]), 1);
        actualRemovedAttendees.push(IDOfAttendeesToRemove[i]);
      }
    }


    config["meetings"][meetingID] = meeting[0] + "|" + meeting[1] + "|" + meetingAttendees + "|" + meeting[3] + "|" + meeting[4];

    for (var i = 0; i < actualRemovedAttendees.length; i++) {
      var username = actualRemovedAttendees[i];
      for (var j = 0; j < 16; j++) {
        if (config["users"][username][meeting[0]][j] == meetingID)
          config["users"][username][meeting[0]][j] = 0;
      }
    }

    fs = require('fs');
    var m = JSON.parse(fs.readFileSync('./mock.json').toString());
    fs.writeFile('./mock.json', JSON.stringify(config));
  }
    // start a conversation with the user.
    bot.startConversation(message, getIDOfAttendeeToRemove);

    bot.reply(message, "Let us remove the member from the meeting.");
});

//coversation to cancel the meeting
controller.hears(['^deschedule$', '^cancel$'],['mention', 'direct_mention'], function(bot,message) {

  var cancellationRequestingUser = message.user;

  var meetingID;

  var getIDOfMeeting = function(err, convo){

        var keys=Object.keys(meet["meetings"]);
        
        //var last=keys[keys.length-1];
        console.log("here are the events");
        console.log(keys);
        convo.say("these are the meeting details preceding with IDs");

      for(var i=0;i<keys.length; i++) {
              convo.say(keys[i]+" "+meet["meetings"][keys[i]].split('|')[1]);
      }



    convo.ask('May I know the meeting ID?',function(response,convo) {


      meetingID = response.text;

      // if(cancellationRequestingUser in meeting.getUsers()) //Some type of validaion required here.
      confirmCancellation(response, convo);
      // else
      // convo.say("You are not authorized for this action.");
      convo.next();
    })
  };

  var confirmCancellation = function(err, convo){
    convo.ask('Are you sure you want to cancel the meeting?',function(response,convo) {
      var confirmation = response.text;

      if(confirmation.toUpperCase() === "YES"){
        cancelMeeting();
        convo.say("Meeting has been cancelled.");

      }else{
        convo.say("Meeting NOT found.");
      }

      convo.next();
    })
  };

  var cancelMeeting = function(err, convo){
    //
    /*if(config["meetings"][meetingID])
    {
    var cancelval = config["meetings"][meetingID].split("|");
    for(var i = 0 ; i < cancelval.length ; i++){
      cancelval[i] = cancelval[i].trim();
    }
    var canceldate = cancelval[0];
    var canceluser = cancelval[2].split(",");
    //var canceltime = cancelval[1];

    for(var p=0; p< canceluser.length; p++){

      for(var d=0; d<16; d++)
      {
        if(config["users"][canceluser[p]][canceldate][d]==meetingID)
          config["users"][canceluser[p]][canceldate][d]= 0;

      }

    }*/
    var delevent = meet["meetings"][meetingID].split("|");
     //var ID_todel = delevent[0];
    eventsHelper.event_delete(primaryUserAuth, delevent[0]);

    //console.log(meetingID);



    delete meet["meetings"][meetingID];

    fs = require('fs');
    var m = JSON.parse(fs.readFileSync('./meetings.json').toString());
    fs.writeFile('./meetings.json', JSON.stringify(meet));

    
    /*else
    {

      bot.reply(message, "meetingID invalid.");



    }*/

  }

  // start a conversation with the user.
  bot.startConversation(message, getIDOfMeeting);

  bot.reply(message, "Let us cancel the meeting.");
  
});

//coversation to reschedule the meeting
controller.hears(['^reschedule$'],['mention', 'direct_mention'], function(bot,message) {

  var rescheduleRequestingUser = message.user;

  var meetingID;

  var getIDOfMeeting = function(err, convo){
    convo.ask('May I know the meeting ID?',function(response,convo) {
      meetingID = response.text;

      // if(cancellationRequestingUser in meeting.getUsers()) //Some type of validaion required here.
      confirmReschedule(response, convo);
      // else
      // convo.say("You are not authorized for this action.");
      convo.next();
    })
  };

  var confirmReschedule = function(err, convo){
    convo.ask('Are you sure you want to reschedule the meeting?',function(response,convo) {
      var confirmation = response.text;

      if(confirmation.toUpperCase() === "YES"){
        cancelMeeting();
        convo.say("Meeting has been rescheduled.");
      }else{
        convo.say("Meeting NOT rescheduled.");
      }

      convo.next();
    })
  };

  var cancelMeeting = function(){
    //

  };

  // start a conversation with the user.
  //bot.startConversation(message, getIDOfMeeting);

  //bot.reply(message, "Let us cancel the meeting.");
});
