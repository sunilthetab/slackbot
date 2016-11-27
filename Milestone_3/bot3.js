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
var lastDay;
var lastTime;

var moment = require('moment');

var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
// process.env.USERPROFILE) + '/Azra_MeetingBot/Milestone_3_Practise/';
var TOKEN_PATH = TOKEN_DIR + 'store.json';

var MEETING_PATH = TOKEN_DIR + 'meetings.json';


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */


/*
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
*/


var daythis;
var mdaythis;
var meetingID;
var slots;
var roomid;
var meetingslot;
var slotpassed;


var Botkit = require('botkit');

var controller = Botkit.slackbot({
    debug: false
    //include "log: false" to disable logging
    //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
    token: process.env.ALTCODETOKEN,
    // token : 'xoxb-91906944081-hDZ6yhSgzHCwdScbabgBFcka',
    //slack bot token here
}).startRTM()



var config = require(TOKEN_PATH);
var meetingsData = require(MEETING_PATH);
var meetinghh;
var meetingmm;
var meetingday;
var meetingStartTime;
//


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

            for(var i = 0 ; i < users.length ; i++){
                users[i] = users[i].trim();
                var user = users[i];
                if(!config["users"].hasOwnProperty(user)){
                    convo.say('Employee ' + user +' is not a member of this team. Please limit to the members only and try again.');
                    getIDOfAttendees(response, convo);
                    convo.next();
                    return;
                }
            }

            getApproxMeetingDuration(response, convo);
            convo.next();
        });
    };

var getApproxMeetingDuration = function(err, convo){
        convo.ask('OK. What will be the approximate duration of the meeting (HH:MM or HH)?',function(response,convo) {
            var approxMeetingDuration = response.text;

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
            lastDay=lastDate;
            console.log('bY:' + (byYear + 1900) + ' bM: ' + byMonth + 'bD' + byDate);

            getLastTime(response, convo);

            convo.next();
        });
    };

    // Asks the user whether ther is any time by which the meeting should be organized.
    var getLastTime = function(err, convo){
        convo.ask('OK. By what time (HH:MM or HH) should the meeting be organized (24 Hour format)? Say NA if no such constraint',function(response,convo) {
            if(response.text.toUpperCase === 'NA')
            {
                constraintOnTime=false;
            }else{
                lastTime = response.text;
                console.log('igottaby '+lastTime);
                //today's date and time
                var today = new Date();
                //user's specified date
                var timeArray = lastTime.split(" ");
                if(lastTime.indexOf(":") > -1)
                    timeArray = lastTime.split(":");

                byTime_Hour = parseInt(timeArray[0]);
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

            console.log('byM:' + byTime_Minute + ' bH: ' + byTime_Hour);
            getAgenda(response, convo);
            convo.next();

        });
    };

    var getAgenda = function(err, convo){
        convo.ask('What is the goal of this meeting?',function(response,convo) {
            meetingGoal = response.text;


            // Initialized just for testing.
            // newMeetingStartDay = 13;
            // newMeetingStartHour = 2;
            // newMeetingStartYear = 2016;
            // newMeetingStartMonth = 11;
            // newMeetingStartMinute = 0;

            if(approxMeetingDuration_Mins > 0) approxMeetingDuration_Hours++;


            /*
             Now we have all the data that we need.

             Please write the code to find the best meeting time.

             Please do validation with by_*** variables if respective constraint exist.

             Store the final data in the following variables:
             var newMeetingStartHour;
             var newMeetingStartMinute;
             var newMeetingStartDay;
             var newMeetingStartMonth;
             var newMeetingStartYear;
             And then call getAgenda.
             */

            calculateFreeTime(function(time){
              fixMeeting(response, convo);
              convo.next();
            });
        });
    };

    var calculateFreeTime = function(callback){
        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }
            authorize(JSON.parse(content), function(allEventsData){
              // console.log('All Events Data: ' + JSON.stringify(allEventsData));
              // Find the time here now...
              // We have all users event data in a JSON object.
              // userName : [event]

              var unavailableUser = users[0];
              var lastEventNumberExtracted = {};
              for(var i = 0 ; i < users.length ; i++){
                lastEventNumberExtracted = _.extend(lastEventNumberExtracted, JSON.parse('{"' + users[i] + '":"0"}'));
              }

              var meetingCanBeOrganized = true;
              var checkingTime = 0;

              while(meetingCanBeOrganized){
                console.log('unavailableUser: ' + unavailableUser);
                var lastEventNumber = parseInt(lastEventNumberExtracted[unavailableUser]);
                console.log('LEN: ' + lastEventNumber + ' LLL: ' + allEventsData[unavailableUser].length);
                var availableForHours = -1;
                var startingNextDay = false;
                while (availableForHours < approxMeetingDuration_Hours && !startingNextDay) {
                  console.log('--LEN:  ' + lastEventNumber);
                  if(lastEventNumber >= allEventsData[unavailableUser].length - 1){
                    // Out of time!! Meeting cannot be setup
                    console.log('11111cannot schedule');
                    meetingCanBeOrganized = false;
                    break;
                  }else{
                    // console.log('checking for unavailable User: ' + unavailableUser);
                    // console.log('\tEvent Summary: ' + allEventsData[unavailableUser][lastEventNumber].summary);
                    // console.log('\tlastEnd: ' + moment(allEventsData[unavailableUser][lastEventNumber].end.dateTime).format());
                    // console.log('\tstartEnd: ' + moment(allEventsData[unavailableUser][lastEventNumber].start.dateTime).format());

                    var startDate = moment(allEventsData[unavailableUser][lastEventNumber + 1].start.dateTime);
                    var endDate = moment(allEventsData[unavailableUser][lastEventNumber].end.dateTime);
                    console.log('ED: ' + endDate.format());
                    availableForHours = moment.duration(startDate.diff(endDate)).asHours();

                    var dateTimeFor5 = moment(new Date(endDate.year(), endDate.month(), endDate.day(), 17, 0, 0, 0));

                    // console.log('\t\t\tAvailable for: ' + availableForHours);

                    if(availableForHours >= approxMeetingDuration_Hours && moment.duration(dateTimeFor5.diff(endDate)).asHours() < (approxMeetingDuration_Hours)){
                      var nextDay = endDate;
                      nextDay.add(1, 'days');
                      nextDay.set('hour', 8);
                      availableForHours = moment.duration(startDate.diff(nextDay)).asHours();
                      // console.log('ND: ' + nextDay.format());
                      // console.log('SD: ' + startDate.format());
                      console.log('ED: ' + endDate.format());
                      // console.log('\t\t\t\t\tAvailable for: ' + availableForHours);
                      if(availableForHours >= approxMeetingDuration_Hours){
                        startingNextDay = true;
                        break;
                      }
                    }
                    // console.log('\tAvailable for: ' + availableForHours);
                    lastEventNumber++;
                  }
                }

                lastEventNumberExtracted[unavailableUser] = lastEventNumber;

                if(lastEventNumber == 0 || startingNextDay){
                  checkingTime = endDate;
                }else{
                  checkingTime = moment(new Date(allEventsData[unavailableUser][lastEventNumber - 1].end.dateTime));
                }

                console.log('CT: ' + checkingTime.format());

                if(users.length == 1) break;

                // check if all other users are avaialable at this time.
                for(var userNum in users){
                  var user = users[userNum];
                  if(user !== unavailableUser){
                    // console.log('uname: ' + user + '\n///////////////');
                    var lastEventNumberOfThisUser = parseInt(lastEventNumberExtracted[user]);
                    // console.log(lastEventNumberOfThisUser);
                    if(lastEventNumberOfThisUser < allEventsData[user][lastEventNumberOfThisUser].length - 1){
                      // check at this time
                      if(moment.duration(moment(allEventsData[user][lastEventNumberOfThisUser].end.dateTime).diff(checkingTime)) >= 0 && moment.duration(checkingTime.diff(moment(allEventsData[user][lastEventNumberOfThisUser + 1].start.dateTime)), 'hours') >= approxMeetingDuration_Hours){
                        // free at this checking time.
                        continue;
                      }else{
                        unavailableUser = user;
                      }
                    }
                  }
                }
              }
              // got the time at which all are available for this duration.
              console.log('Got time: ' + checkingTime);
            });
        });
    }

    function authorize(credentials, callback) {
       // console.log(daythis+'step 2');
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
                var allEventsInfo = {};

                for(var i = 0 ; i < users.length ;){
                  oauth2Client.credentials = allData.users[users[i]];
                  !function x(j){
                    getEventsOf(oauth2Client, users[j], function(response){
                      console.log('----un: ' + users[j] + ' & i: ' + i + ' & j: ' + j);
                      var entry = '{"' + users[j] + '":' + JSON.stringify(response) + '}';
                      // console.log('Entry: ' + entry);
                      allEventsInfo = _.extend(allEventsInfo, JSON.parse(entry));
                      if(j == users.length - 1){
                        console.log('jjjjjj: ' + j);
                        callback(allEventsInfo);
                      }
                    });
                  }(i)
                }
            }
        });
    }

    function getEventsOf(auth, user, callback) {
        var calendar = google.calendar('v3');
        calendar.events.list({
            auth: auth,
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            // maxResults: 10,
            timeMax: (new Date(byYear + 1900, byMonth, byDate, byTime_Hour, byTime_Minute, 0, 0)).toISOString(),
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
                console.log('Found events for user: ' + user);
            }
            callback(events);
        });
    }

    // var checkforthistime = function(user,daythis,meetingStartTime,approxMeetingDuration_Hours){
    //     fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    //         if (err) {
    //             console.log('Error loading client secret file: ' + err);
    //             return;
    //         }
    //         // Authorize a client with the loaded credentials, then call the
    //         // Google Calendar API.
    //         //  console.log(daythis+"in calca"+JSON.parse(content));
    //         authorize(JSON.parse(content),user,daythis,meetingStartTime,approxMeetingDuration_Hours,checkTime);
    //     });
    //
    // }


    // function checkTime(auth,user,daythis,meetingStartTime,approxMeetingDuration_Hours) {
    //     // console.log("step  1  daythis pesn"+user+" day  "+daythis+" hh "+hh+"dfsfds"+approxMeetingHours);
    //     var calendar = google.calendar('v3');
    //
    //     var timenow=moment(meetingStartTime.toISOString()).format();
    //     var timelast=moment(timenow).add(approxMeetingDuration_Hours, 'hours');
    //     //console.log(timelast);
    //     calendar.events.list({
    //         auth: auth,
    //         calendarId: 'primary',
    //         timeMin: timenow,
    //         timeMax: timelast,
    //         maxResults: 10,
    //         singleEvents: true,
    //         timeZoneId: 'America/New_York',
    //         timeZone: 'America/New_York',
    //         orderBy: 'startTime'
    //     }, function(err, response) {
    //         if (err) {
    //             console.log('The API returned an error: ' + err);
    //             return;
    //         }
    //         var events = response.items;
    //         if (events.length == 0) {
    //             //success
    //
    //             return;
    //         } else {
    //             //  console.log('Upcoming 10 events of ' + user + ':');
    //             //flag false find again
    //         }
    //     });
    //
    //
    // }

    var fixMeeting = function(err, convo){
        convo.ask('Do you want to fix this meeting time? Please reply Yes or No',function(response,convo) {
            var answer = response.text;
            if((answer==='no')||(answer==='No')||(answer==='NO')){
                // bot.startConversation(message, getLastTime);
                bot.reply(message, 'The meeting was NOT organized. Thank you for using Azra.');
                convo.next();
            }else{
                bot.reply(message, 'I am confirming this meeting/');

                // Azra will store the meeting details in the file meetings.json at MEETING_PATH.
                var allMeetingKeys = Object.keys(meetingsData["meetings"]);
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

                fs.writeFile(MEETING_PATH, JSON.stringify(meetingsData)); // asynchronous write.

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

    // var calculateCommonTime=function(users,meetingStartTime,approxMeetingDuration_Hours){
    //     console.log(" 1 here ");
    //     var hh=meetingStartTime.getHours();
    //     if(hh+approxMeetingDuration_Hours>17||hh>17){
    //         meetingStartTime.setHours(10);
    //         meetingStartTime.setDate(today.getDate()+1);
    //     }
    //     meetingStartTime=calculateFreeTime(users[0],meetingStartTime,approxMeetingDuration_Hours);
    //
    //     console.log('should be second'+meetingStartTime);
    //
    //     checkforthistime(users,meetingStartTime,approxMeetingDuration_Hours);
    // }


    // var checkforthistime=function(users,meetingStartTime,approxMeetingDuration_Hours){
    //     var check=true;
    //     var i;
    //     var k;
    //     for(k=0;k<(users.length-1);k++) {
    //         checkTime(user[k+1],meetingStartTime,approxMeetingDuration_Hours);
    //         if(check==false){
    //             meetingStartTime=moment(meetingStartTime).add(1,'hours');
    //             calculateCommonTime(users,meetingStartTime,approxMeetingDuration_Hours);
    //         }
    //     }
    //     if(check==true){
    //         //got the values
    //     }
    //
    //
    // }

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
    var meetingID;

    var getIDOfNewAttendee = function(err, convo){
        convo.ask('May I know the email IDs of the new attendees, please?',function(response,convo) {
            newAttendeeIDs = response.text.split(" ");

            if(response.text.indexOf(",") > -1){
                newAttendeeIDs = response.text.split(",");
            }

            getIDOfMeeting(response, convo);

            convo.next();
        })
    };

    var getIDOfMeeting = function(err, convo){
        convo.ask('Alright. What is the meeting ID?',function(response,convo) {

            meetingID = parseInt(response.text);

            adjustMeeting();

            var meeting = config["meetings"][meetingID].split("|");
            convo.say("Members Added");
            var display = "Preview: Meeting ID "+ meetingID +" & List of members: " + meeting[2];
            convo.say(display);
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
            IDOfAttendeesToRemove = response.text.split(' ');

            getIDOfMeeting(response, convo);

            convo.next();
        })
    };

    var getIDOfMeeting = function(err, convo){
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
        if(config["meetings"][meetingID])
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

            }

            console.log(meetingID);



            delete config["meetings"][meetingID];

            fs = require('fs');
            var m = JSON.parse(fs.readFileSync('./mock.json').toString());
            fs.writeFile('./mock.json', JSON.stringify(config));

        }
        else
        {

            bot.reply(message, "meetingID invalid.");



        }

    };

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
