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

var moment = require('moment');

var _ = require('underscore');
var fs = require('fs');

var google = require('googleapis');
var googleAuth = require('google-auth-library');
var lastDay;
var lastTime;

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
    // token : 'xoxb-102636740736-2cK5dXthHBoEpvVtnvy9wxZ1',
    // token: 'xoxb-75413084788-LQt1Rejkw8HnkCAO1R1DOXxI',//Azra bot in SunilCorp
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
controller.hears(['^schedule$', '^setup$','^a$'],['mention', 'direct_mention'], function(bot,message) {

    // Asks the users and stores.
    var approxMeetingDuration_Hours = 0;
    var approxMeetingDuration_Mins = 0;
    var approxMeetingDuration_OnlyInMins = 0;

    //Contains all email ids
    var users = [];

    // New meeting details that Azra calculates.
    var newMeetingStartHour;
    var newMeetingStartMinute;
    var newMeetingStartDay;
    var newMeetingStartMonth;
    var newMeetingStartYear;

    var meetingStartDateTime;
    var meetingEndDateTime;

    var maximalDateTimeNonISO;

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
    var usersInMeeting;

    var meetingEndTime;

    var calendarIDs = [];

    // Gets all the ids. If any is invalid, asks again. If succesfull, azra asks about approximate meeting duration.
    var getIDOfAttendees = function(err, convo)
    {
        convo.ask('Alright. May I know the email IDs of the attendees, please?',
            function(response,convo)
        {
            var IDofAttendees = response.text

            users = IDofAttendees.split(" ");
            if(IDofAttendees.indexOf(',') > -1){
              users = IDofAttendees.split(",");
            }

            var indCol;
            for(var i = 0 ; i < users.length ; i++){
              indCol = users[i].indexOf(':');
              if(indCol<0){
                bot.reply(message, 'Please enter valid email address of ' + users[i]);
                getIDOfAttendees(response, convo);
                convo.next();
                return;
              }
              var barInd = users[i].indexOf('|', indCol);
              users[i] = users[i].substring(indCol + 1, barInd);
            }

            var slackTeamMembersEmail = [];

             bot.api.users.list({}, (error, response) =>
             {
                 if(error)
                 {
                   console.log('error!');
                 }
                 for(var i = 0, j = 0; i < response.members.length; i++)
                 {
                   if(response.members[i].profile.hasOwnProperty('email')){
                     slackTeamMembersEmail[j] = JSON.stringify(response.members[i].profile.email);
                       slackTeamMembersEmail[j]=slackTeamMembersEmail[j].substring(1,slackTeamMembersEmail[j].length-1);
                     console.log('--' + slackTeamMembersEmail[j]);
                     console.log(slackTeamMembersEmail.length);
                     j++;
                   }
                 }

                 for(var i = 0 ; i < users.length ; i++)
                 {
                     var user = users[i];
                     if(!config["users"].hasOwnProperty(user)){
                         bot.reply(message, 'I am not authorized to access calendar of ' + user +'. Please ask him to give permission to access calendar and try again.');
                         convo.next();
                         return;
                     }
                     for(var j = 0 ; j < slackTeamMembersEmail.length ; j++){
                       if(user === slackTeamMembersEmail[j]){
                         break;
                       }
                       // This user is not a member of this team!
                       // Comment these lines for testing.
                        //client_secretot a member of this team. Please limit to only the members of the team and try again.');
                       if(j === slackTeamMembersEmail.length - 1){
                         convo.next();
                         return;
                       }
                     }
                 }

                 getApproxMeetingDuration(response, convo);
                 convo.next();
             });

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
            approxMeetingDuration_OnlyInMins = approxMeetingDuration_Hours * 60 + approxMeetingDuration_Mins;

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
            //today's date and time
            var today = new Date();

            byDate = today.getDate();
            byMonth = today.getMonth();
            byYear = today.getYear();

            // If there is no such constraint.
            if(response.text=='na'||response.text=='Na'||response.text=='NA')
            {
                constraintOnDay=false;
            }else{
                lastDate = response.text;

                //user's specified date
                var dateArray = lastDate.split(" ");
                if(lastDate.indexOf("/") > -1)
                    dateArray = lastDate.split("/");

                if(dateArray[0].match(/[0-9]+/)){//It's a number
                    if(dateArray.length == 1){
                        byDate = parseInt(dateArray[0]);
                        // console.log("bydate "+byDate + " date:" + today.getDate());
                        if(byDate < today.getDate()){
                            convo.say("I can't organize a meeting in the past! Please try again.");
                            getLastDateOrDay(response, convo);
                            convo.next();
                            return;
                        }
                    }else if(dateArray.length == 2){
                        byDate = parseInt(dateArray[1]);
                        byMonth = parseInt(dateArray[0]);
                        // console.log("byMonth "+byMonth+" "+today.getMonth());
                        // console.log("byDate " + byDate + " " + today.getDate());
                        if(byMonth < today.getMonth() || ((byMonth - 1) >= today.getMonth() && byDate < today.getDate())){
                            convo.say("I can't organize a meeting in the past! Please try again.");
                            getLastDateOrDay(response, convo);
                            convo.next();
                            return;
                        }
                    }else{
                        byDate = parseInt(dateArray[1]);
                        byMonth = parseInt(dateArray[0]);
                        byYear = parseInt(dateArray[2]) - 1900;
                        // console.log("byMonth "+byMonth+" "+today.getMonth());
                        // console.log("byDate " + byDate + " " + today.getDate());
                        // console.log("byYear " + byYear + " " + today.getYear());
                        if(byYear < today.getYear() || (byYear === today.getYear() && ((byMonth - 1) < today.getMonth()) || (byYear === today.getYear() && (byMonth - 1) === today.getMonth() && byDate < today.getDate()))){
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
                lastDay=lastDate;
                // console.log('bY:' + (byYear + 1900) + ' bM: ' + byMonth + 'bD' + byDate);
            }

            getLastTime(response, convo);

            convo.next();
        });
    };

    // Asks the user whether ther is any time by which the meeting should be organized.
    var getLastTime = function(err, convo){
        convo.ask('OK. By what time (HH:MM or HH) should the meeting be organized (24 Hour format)? Say NA if no such constraint',function(response,convo) {
            if(response.text=='na'||response.text=='Na'||response.text=='NA')
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

                // Meeting duration is greater than available max time in a day! Ask the user to enter by_time again.
                var maxValidTimeInADay = (byTime_Hour - 8) * 60 + byTime_Minute;
                if(maxValidTimeInADay < approxMeetingDuration_OnlyInMins){
                  convo.say("Meeting duration is greater than available max time in a day! Please increase the time by which I should setup meeting.");
                  getLastTime(response, convo);
                  convo.next();
                  return;
                }

                // If the user wants to organize a meeting by next day, check if the duration matches the meeting duration.
                if(byDate === today.getDate() || byDate === today.getDate() + 1){

                    var meetingDurationInMin = approxMeetingDuration_Hours * 60 + approxMeetingDuration_Mins;

                    var timeLeftInMin = (new Date(1900 + byYear, byMonth, byDate, byTime_Hour, byTime_Minute, 0, 0) - new Date()) / (1000 * 60);

                    // If there is no sufficient time, ask the user to give the details again. Hadnled in HandleInsufficientTime.
                    if(timeLeftInMin < meetingDurationInMin){
                        HandleInsufficientTime(response, convo);
                        convo.next();
                        return;
                    }
                }
                // console.log('byM:' + byTime_Minute + ' bH: ' + byTime_Hour);
            }

            getAgenda(response, convo);
            convo.next();

        });
    };

    var getAgenda = function(err, convo){
        convo.ask('What is the goal of this meeting?',function(response,convo) {
            meetingGoal = response.text;

            calculateFreeTime(users, newMeetingStartDay, approxMeetingDuration_Hours, approxMeetingDuration_Mins, function()
            {
              if(meetingStartDateTime === null){
                convo.say("No available duration found. Please try again with a different combination of inputs.");
                convo.next();
                return;
              }else{
                bot.reply(message, 'I found the best time on ' + meetingStartDateTime+ '.');
                fixMeeting(response, convo);
                convo.next();
              }
            });
        });
    };

    var calculateFreeTime = function(user, onDay, approxMeetingHours,approxMeetingMins, callback)
    {
        fs.readFile('client_secret.json', function processClientSecrets(err, content)
        {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }
            authorize(JSON.parse(content), function(allEventsData)
            {
                console.log('All Events Data: ' + JSON.stringify(allEventsData));
                  // Find the time here now...
                  // We have all users event data in a JSON object.
                  // userName : [event]

                //Initializes and array of calendar "calen"
                // all those variables with comment "user parameter" above them can be changed as per developer's viewpoint
                //  work hours set from 8AM to 6PM: "user parameter"
                var workHours =  [8,18];
                // No weekends: "user parameter"
                var noWeekends = true;
                // assigning priority from 8AM to 6PM: "user parameter"
                var priority = [4,5,6,7,8,5,8,9,6,3];
                // split time: 30min. 1 Hr = 2 x 30min: "user parameter" or 1 Hr = 4 x 15min
                // split [1: 60min, 2: 30min, 4: 15min, 6: 10min]
                var split = 4;

                var priorityInADay = [];
                var k =0;

                var today = new Date();
                var thisYear = today.getYear()
                var thisDate = today.getDate();
                var thisMonth = today.getMonth(); //January is 0!
                var thisHour = today.getHours();
                if(!(typeof byTime_Hour == 'undefined' || !byTime_Hour))
                {
                     if(parseInt(byTime_Hour) < workHours[1] &&  parseInt(byTime_Hour) >= workHours[0])
                     {
                      workHours[1] = parseInt(byTime_Hour);
                     }
                }
                 var spread = workHours[1] - workHours[0];

                for(var i =0; i < priority.length; i++){
                    for(var j =0; j < split; j++){
                        priorityInADay[k++] = priority[i];
                    }
                }

                // get the number of days upto which we have to compute the calendar optimum time.
                var dateDifference =  Math.floor(( new Date(maximalDateTimeNonISO.getYear(), maximalDateTimeNonISO.getMonth(), maximalDateTimeNonISO.getDate(),0,0,0,0) -  new Date(today.getYear(), today.getMonth(), today.getDate(),0,0,0,0)) / 86400000);
                var uptoDays = dateDifference + 1;

                var calen = new Array(uptoDays);
                for (var i =0; i < uptoDays; i++){
                    calen[i] = Array.from(priorityInADay);
                }

                var priorityToday = Array.from(priorityInADay);

                k = 0;
                for(var i =0; i < thisHour - workHours[0]; i++){
                    for(var j =0; j < split; j++){
                        priorityToday[k++] = 0;
                    }
                }
                calen[0] = priorityToday;
                // change array for weekend into empty array
                if(noWeekends){
                    var day = today.getDay();
                    var _uptoDays = uptoDays;

                    for(var w=0; w < _uptoDays; w++){
                        if((day+1) % 7 == 0 || day % 7 == 0){
                            calen[w] = [];
                        }
                        day++;
                    }
                }

                var allUsersEventsArrayObjects = [];
                for(var eachUserKey in allEventsData)
                {
                    allUsersEventsArrayObjects.push(allEventsData[eachUserKey]);
                }
                var allUsersEventsArray = [];
                var eachUserAllEvents = allUsersEventsArrayObjects[0];

                for(var eachUser in allUsersEventsArrayObjects)//take each user one by one
                {
                    var allEventsOfAUser = allUsersEventsArrayObjects[eachUser]
                    for (var eachEventKey in allEventsOfAUser)//take each events one by one
                    {
                        var individualEvent = allEventsOfAUser[eachEventKey];

                        var startDatetime = new Date(individualEvent["start"]["dateTime"]);
                        var endDatetime = new Date(individualEvent["end"]["dateTime"]);

                        // If not weekend event continue
                        if(!(startDatetime.getDay() == 6 || startDatetime.getDay() == 7))// If not weekend event continue
                        {
                            //gets difference between today and the event date.
                            var dateDifference =  Math.floor(( new Date(startDatetime.getYear(), startDatetime.getMonth(), startDatetime.getDate(),0,0,0,0)-  new Date(today.getYear(), today.getMonth(), today.getDate(),0,0,0,0)) / 86400000);

                            var thatDayPriority = Array.from(calen[dateDifference]);

                            var fromHour = (startDatetime.getHours()-workHours[0] )* split;

                            fromHour += Math.floor(startDatetime.getMinutes() * split/60);
                            if(fromHour < 0){
                                fromHour = 0;
                            }else if(fromHour >= spread * split)
                            {
                                fromHour = spread * split;
                            }

                            var toHour = (endDatetime.getHours()-workHours[0]) * split;

                            toHour += Math.floor(endDatetime.getMinutes() * split/60);
                            if(toHour < 0){
                                toHour = 0;
                            }else if(toHour >= spread * split)
                            {
                                toHour = spread * split -1;
                            }

                            for(var i =fromHour; i <= toHour; i++){
                                thatDayPriority[i] = 0;
                            }
                            calen[dateDifference] = Array.from(thatDayPriority);
                        }
                    }
                }

                var optimumFromCalen = Array.from(calen);
                var max = 0;
                var optimumDateSlot = 0;
                var optimumTimeSlot = 0;

                var slotsCount =(split * approxMeetingHours) + Math.ceil(split * approxMeetingMins/60); // 8 = 4 * 2HR
                for(var i=0; i< optimumFromCalen.length; i++ )
                {
                    for(var j=0; j< optimumFromCalen[i].length;j++)
                    {
                        if(j > optimumFromCalen[i].length - slotsCount)
                        {
                            optimumFromCalen[i][j] = 0;
                        }
                        else
                        {
                            for(var ij= j; ij < j + slotsCount ; ij++)
                            {
                                if(optimumFromCalen[i][ij] == 0 || optimumFromCalen[i][j] == 0)
                                {
                                    optimumFromCalen[i][j] = 0;
                                    break;
                                }
                                else
                                {
                                    optimumFromCalen[i][j] += optimumFromCalen[i][ij];
                                    if(optimumFromCalen[i][j] > max)
                                    {
                                        max = optimumFromCalen[i][j];
                                        optimumTimeSlot = j;
                                        optimumDateSlot = i;
                                    }
                                }
                            }
                        }
                    }
                }
                if(max > 0)
                {
                meetingStartDateTime = new Date(1900 + thisYear, thisMonth,thisDate, workHours[0] + Math.floor(optimumTimeSlot/ split), (optimumTimeSlot % split) * 15, 0, 0);
                //Final Meeting Start datetime. this is a global variable used while creating the event
                meetingStartDateTime.setDate(thisDate + optimumDateSlot);

                meetingEndDateTime = new Date(meetingStartDateTime);
                //Final Meeting End datetime. this is a global variable used while creating the event
                meetingEndDateTime.setMinutes(meetingStartDateTime.getMinutes() + approxMeetingHours * 60 + approxMeetingMins);
                }
                else
                {
                    meetingStartDateTime = null;
                    meetingEndDateTime = null;
                }
              callback();
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
        fs.readFile(TOKEN_PATH, function(err, fileData)
        {
            if (err)
            {

                console.log("error while reading usersData.json");

            }
            else
            {
                var allData = JSON.parse(fileData);
                var allEventsInfo = {};
                var xxx = 0;
                for(var i = 0 ; i < users.length ; i++){
                  oauth2Client.credentials = allData.users[users[i]];
                  !function x(j){
                    getEventsOf(oauth2Client, users[j], function(response){
                      console.log('----un: ' + users[j] + ' & xxx: ' + xxx);
                      xxx = xxx + 1;
                      var entry = '{"' + users[j] + '":' + JSON.stringify(response) + '}';
                      // console.log('Entry: ' + entry);
                      allEventsInfo = _.extend(allEventsInfo, JSON.parse(entry));
                      // if(j == users.length - 1) callback(allEventsInfo);
                      if(xxx == users.length) callback(allEventsInfo);
                    });
                  }(i)
                }
            }
        });
    }

    function getEventsOf(auth, user, callback) {
        var calendar = google.calendar('v3');
        // console.log('getEventsOf ::: bY:' + (byYear + 1900) + ' bM: ' + byMonth + 'bD' + byDate);
        // console.log((new Date(byYear + 1900, byMonth - 1, byDate, byTime_Hour, byTime_Minute, 0, 0)).toISOString());
        var maximalDateTime;
        if(constraintOnDay){
          if(constraintOnTime){
            // byMonth - 1 because of 0-11 indexes
            // byYear + 1900 because 19000 is offset in JS
              maximalDateTimeNonISO = new Date(byYear + 1900, byMonth - 1, byDate, byTime_Hour, byTime_Minute, 0, 0);
              maximalDateTime = maximalDateTimeNonISO.toISOString();

          }else{
            // default is 6pm; js has 0-23 hour format
              maximalDateTimeNonISO = new Date(byYear + 1900, byMonth - 1, byDate, 23, 59, 0, 0);
              maximalDateTime = maximalDateTimeNonISO.toISOString();
          }
        }else{
          if(constraintOnTime){
            maximalDateTime = new Date();
            maximalDateTime.setDate(maximalDateTime + 20);
            maximalDateTime.setHours(byTime_Hour);
            maximalDateTime.setMinutes(byTime_Minute);
              maximalDateTimeNonISO = maximalDateTime;
          }else{
            maximalDateTime = new Date();
            maximalDateTime.setDate(maximalDateTime + 20);
            maximalDateTime.setHours(23); 
            maximalDateTime.setMinutes(59);
              maximalDateTimeNonISO = maximalDateTime;
          }
        }

        calendar.events.list({
            auth: auth,
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            timeMax: maximalDateTime,
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

    var fixMeeting = function(err, convo){
        convo.ask('Do you want to fix this meeting time? Please reply Yes or No',function(response,convo) {
            var answer = response.text;
            if((answer==='no')||(answer==='No')||(answer==='NO')){
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

                usersInMeeting = users[0];

                meetingStartTime = meetingStartDateTime; //new Date(newMeetingStartYear, newMeetingStartMonth, newMeetingStartDay, newMeetingStartHour, newMeetingStartMinute, 0, 0).toISOString();
                meetingEndTime = meetingEndDateTime; //new Date(newMeetingStartYear, newMeetingStartMonth, newMeetingStartDay, newMeetingStartHour + approxMeetingDuration_Hours, newMeetingStartMinute + approxMeetingDuration_Mins, 0, 0).toISOString();

                for(var i = 1 ; i < users.length ; i++)
                    usersInMeeting += ', ' + users[i];

                meetingsData["meetings"][newMeetingID] = {};
                meetingsData["meetings"][newMeetingID]["users"] = usersInMeeting;
                meetingsData["meetings"][newMeetingID]["summary"] = meetingGoal;
                meetingsData["meetings"][newMeetingID]["startDateTime"] = meetingStartDateTime; //new Date(newMeetingStartYear, newMeetingStartMonth, newMeetingStartDay, newMeetingStartHour, newMeetingStartMinute, 0, 0).toISOString();
                meetingsData["meetings"][newMeetingID]["endDateTime"] = meetingEndDateTime; //new Date(newMeetingStartYear, newMeetingStartMonth, newMeetingStartDay, newMeetingStartHour + approxMeetingDuration_Hours, newMeetingStartMinute + approxMeetingDuration_Mins, 0, 0).toISOString();
                meetingsData["meetings"][newMeetingID]["duration"] = approxMeetingDuration_Hours + ':' + approxMeetingDuration_Mins;
                meetingsData["meetings"][newMeetingID]["organizer"] = users[0];

// Add to the calendar of all users.
                createMeetingAndInviteAll(function(eventID){
                  meetingsData["meetings"][newMeetingID]["eventID"] = eventID;
                  fs.writeFile(MEETING_PATH, JSON.stringify(meetingsData)); // asynchronous write.
                  console.log('Updated the calendar of all users.');
                });
//////////////////////////////////
            }
            convo.next();
        });
    };

    var createMeetingAndInviteAll = function(callback){
      fs.readFile('client_secret.json', function processClientSecrets(err, content) {
          if (err) {
              console.log('Error loading client secret file: ' + err);
              return;
          }
          authorizeAndWriteToCalendar(JSON.parse(content), function(eventID){
              callback(eventID);
          });
      });
    }

    var authorizeAndWriteToCalendar = function (credentials, callback) {
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
                var xxx = 0;
                oauth2Client.credentials = allData.users[users[0]];
                addEventToOrganizerAndInviteOthers(oauth2Client, users[0],function(eventID){
                  callback(eventID);
                });
            }
        });
    }

    var addEventToOrganizerAndInviteOthers = function (auth, user, callback) {
        var calendar = google.calendar('v3');

        var attendeesJSON = JSON.parse('[]');

        for(var i = 0 ; i < users.length ; i++){
          //if(users[i] === user)
          attendeesJSON.push({'email':users[i]});
        }

        console.log(JSON.stringify(attendeesJSON));

        var event = {
          'summary': meetingGoal,
          'location': '-------------',
          'description': 'Meeting organized by Azra',
          'start': {
            'dateTime': meetingStartTime.toISOString(),
            'timeZone': 'America/New_York',
          },
          'end': {
            'dateTime': meetingEndTime.toISOString(),
            'timeZone': 'America/New_York',
          },
          'attendees': attendeesJSON,
          'reminders': {
            'useDefault': false,
            'overrides': [
              {'method': 'email', 'minutes': 24 * 60},
              {'method': 'popup', 'minutes': 10},
            ],
          },
        };

        calendar.events.insert({
          auth: auth,
          calendarId: 'primary',
          resource: event,
        }, function(err, event) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
          }
          console.log('Event created: %s', event.htmlLink);
          callback(event.id);
        });
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

    // start a conversation with the user.
    bot.startConversation(message, getIDOfAttendees);

    bot.reply(message, "Let us organize a new meeting.");

});

//coversation to add new member to a meeting
controller.hears(['^Add$', '^new$'],['mention', 'direct_mention'], function(bot,message) {
    var meetingID;
    var currentMeetingStartTime;
    var currentMeetingEndTime;
    var newUsers = [];
    var unavailableUsers = [];

    var getIDOfNewAttendees = function(err, convo){
        convo.ask('May I know the email ID(s) of the new attendee(s), please?',function(response,convo) {

          var IDofAttendees = response.text;

          var indCol = IDofAttendees.indexOf(':');
          if(indCol<0){
            bot.reply(message, 'Please enter valid email address.');
            getIDOfNewAttendees(response, convo);
            convo.next();
            return;
          }
          for(var i = 0 ; indCol > 0; i++){
            var barInd = IDofAttendees.indexOf('|', indCol);
            newUsers[i] = IDofAttendees.substring(indCol + 1, barInd);
            indCol = IDofAttendees.indexOf(':', barInd);
          }

          var existingUsers = meetingsData.meetings[meetingID].users.split(',');

          var allNotNewUsers = "";

          // Check if the new users are already in the meeting and change those user names to -1.
          for(var i = 0 ; i < existingUsers.length ; i++){
            existingUsers[i] = existingUsers[i].trim();
            for(var j = 0 ; j < newUsers.length ; j++){
                if(newUsers[j] === existingUsers[i]){
                  newUsers[j] = '-1';
                  allNotNewUsers += existingUsers[i] + ',';
                  break;
                }
            }
          }

          var anyNewUser = false;
          for(var i = 0 ; i < newUsers.length ; i++){
            if(newUsers[i] !== '-1') anyNewUser = true;
          }

          if(anyNewUser){
            // Which users are already participating out of the entered users, if any.
            if(allNotNewUsers.length > 0){
              bot.reply(message, "These users are already participating in the event: " + allNotNewUsers + '.')
            }
          }else{
            bot.reply(message, 'No new users recognized to add in this event.');
            convo.next();
            return;
          }

          // Check if Azra has permission to access the calendar of these valid new users.
          for(var j = 0 ; j < newUsers.length ; j++){
              if(newUsers[j] !== '-1'){
                if(!config["users"].hasOwnProperty(newUsers[j])){
                    convo.say('I am not authorized acces to ' + newUsers[j] + '\'s calendar. Please ask him to authorize or do not include him and then try again.');
                    convo.next();
                    return;
                }
                continue;
              }
          }

          checkIfAllCanBeAddedAtExistingTime(function(canBeAdded){
            if(canBeAdded){
              // send invite to these users.
              addNewMembers(function(){
                convo.next();
              });
            }else{
              askWhatUserWantsToDo(response, convo);
            }
            bot.reply(message, 'Meeting updated.');
            convo.next();
          });

        })
    };

    var getIDOfMeeting = function(err, convo){
        // Enlist the meetings organized by Azra.

        bot.reply(message, "Here are the meetings organized by me:");

        var meetingsInformation;

        var allIDS = [];
        var i = 0;
        for(var meetingNum in meetingsData.meetings){
          allIDS[i] = meetingNum;
          i++;
          bot.reply(message, 'ID: ' + meetingNum + '\nSummary: ' + meetingsData.meetings[meetingNum].summary);
          bot.reply(message, 'Participants: ' + meetingsData.meetings[meetingNum].users);
          bot.reply(message, 'At time: ' + new Date(meetingsData.meetings[meetingNum].startDateTime));
          bot.reply(message, 'Duration: ' + meetingsData.meetings[meetingNum].duration + '\n');
        }

        convo.ask('Please select the ID of the meeting to which you would like to add new attendees.',function(response,convo) {

            meetingID = parseInt(response.text);

            for(var i = 0 ; i < allIDS.length ; i++){
              if(allIDS[i] === meetingID){
                bot.reply(message, 'Invalid meeting ID selected! Please try again.');
                getIDOfMeeting(response, convo);
                convo.next();
                return;
              }
            }

            currentMeetingStartTime  = meetingsData.meetings[meetingID].startDateTime;
            currentMeetingEndTime  = meetingsData.meetings[meetingID].endDateTime;

            getIDOfNewAttendees(response, convo);
            convo.next();
        })
    };

    var askWhatUserWantsToDo = function(err, convo){
      var allUnAvailableUsers = unavailableUsers[0];
      for(var i = 1 ; i < unavailableUsers.length ; i++){
        allUnAvailableUsers += ', ' + unavailableUsers[i];
      }
        convo.ask("Users " + allUnAvailableUsers + ' are not available at current meeting time. Do you wish to organize the meeting at a new time or continue without these users?',function(response,convo) {
          if(response.text.toUpperCase() === 'continue'){
            // invite only the users which are free.
            if(unavailableUsers.length === newUsers.length){
              bot.reply(message, "No new user can be added. All are unavailable!");
              convo.next();
            }
            for(var i = 0 ; i < unavailableUsers.length ; i++){
              newUsers[newUsers.indexOf(unavailableUsers[i])] = '-1';
            }
            addNewMembers(function(){
              convo.next();
            });
          }else{
            // find a new meeting time for all the users. Cancel previous meeting and schedule new one.

          }
          convo.next();
        })
    };

    var checkIfAllCanBeAddedAtExistingTime = function(callback){
      fs.readFile('client_secret.json', function processClientSecrets(err, content) {
          if (err) {
              console.log('Error loading client secret file: ' + err);
              return;
          }
          authorizeAndCheckForExistingTime(JSON.parse(content), function(){
            if(unavailableUsers.length > 0) callback(false);
            else callback(true);
          });
      });
    }

    var authorizeAndCheckForExistingTime = function (credentials, callback) {
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
                var xxx = 0;
                for(var i = 0 ; i < newUsers.length ; i++){
                  oauth2Client.credentials = allData.users[newUsers[i]];
                  !function x(j){
                    checkEventsOf(oauth2Client, newUsers[j], function(isThisUserFreeAtCurrentMeetingTime, newUserID){
                      if(!isThisUserFreeAtCurrentMeetingTime){
                        unavailableUsers[xxx] = newUserID;
                      }
                      xxx = xxx + 1;
                      if(xxx == newUsers.length) callback();
                    });
                  }(i)
                }
            }
        });
    }

    function checkEventsOf(auth, user, callback) {
        var calendar = google.calendar('v3');
        calendar.events.list({
            auth: auth,
            calendarId: 'primary',
            timeMin: currentMeetingStartTime,
            timeMax: currentMeetingEndTime,
            singleEvents: true,
            orderBy: 'startTime'
        }, function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            var events = response.items;
            if (events.length == 0) {
              // User is free.
              callback(true, user);
            } else {
              // User is busy
              callback(false, user);
            }
        });
    }

    var addNewMembers = function(callback){
      fs.readFile('client_secret.json', function processClientSecrets(err, content) {
          if (err) {
              console.log('Error loading client secret file: ' + err);
              return;
          }
          authorizeAndAdd(JSON.parse(content), function(){
              var usersInMeeting = meetingsData["meetings"][meetingID]["users"];
              for(var i = 0 ; i < newUsers.length ; i++){
                if(newUsers[i] !== '-1'){
                  usersInMeeting += ', ' + newUsers[i];
                }
              }
              meetingsData["meetings"][meetingID]["users"] = usersInMeeting;
              console.log('New users in meeting: ' + usersInMeeting);
              fs.writeFile(MEETING_PATH, JSON.stringify(meetingsData)); // asynchronous write.
          });
      });
    }

    var authorizeAndAdd = function (credentials, callback) {
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
                oauth2Client.credentials = allData.users[meetingsData.meetings[meetingID].organizer];
                updateEvent(oauth2Client, function(){
                  callback();
                });
            }
        });
    }

    var updateEvent = function (auth, callback) {
        var calendar = google.calendar('v3');

        var attendeesJSON = JSON.parse('[]');

        for(var i = 0 ; i < newUsers.length ; i++){
          //if(newUsers[i] === '-1') continue;
          attendeesJSON.push({'email':newUsers[i]});
        }

        var event = {
          'summary': meetingsData.meetings[meetingID].summary,
          'location': '-------------',
          'description': 'Meeting organized by Azra.',
          'start': {
            'dateTime': currentMeetingStartTime.toISOString(),
            'timeZone': 'America/New_York',
          },
          'end': {
            'dateTime': currentMeetingEndTime.toISOString(),
            'timeZone': 'America/New_York',
          },
          'attendees': attendeesJSON,
          'reminders': {
            'useDefault': false,
            'overrides': [
              {'method': 'email', 'minutes': 24 * 60},
              {'method': 'popup', 'minutes': 10},
            ],
          },
        };

        calendar.events.update({
          auth: auth,
          calendarId: 'primary',
          eventId: meetingsData.meetings[meetingID].eventID,
          resource: event,
        }, function(err, event) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
          }
          console.log('Event created: %s', event.htmlLink);
        });

        callback();
    }



    // start a conversation with the user.
    bot.startConversation(message, getIDOfMeeting);

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

    var meetingID;
    var organizer;

    var getIDOfMeeting = function(err, convo){
        // Enlist the meetings organized by Azra.

        bot.reply(message, "Here are the meetings organized by me:");

        var meetingsInformation;

        var allIDS = [];
        var i = 0;
        for(var meetingNum in meetingsData.meetings){
          allIDS[i] = meetingNum;
          i++;
          bot.reply(message, 'ID: ' + meetingNum + '\nSummary: ' + meetingsData.meetings[meetingNum].summary);
          bot.reply(message, 'Participants: ' + meetingsData.meetings[meetingNum].users);
          bot.reply(message, 'At time: ' + new Date(meetingsData.meetings[meetingNum].startDateTime));
          bot.reply(message, 'Duration: ' + meetingsData.meetings[meetingNum].duration + '\n');
        }

        convo.ask('Please select the ID of the meeting which you would like to deschedule.',function(response,convo) {

            meetingID = parseInt(response.text);

            for(var i = 0 ; i < allIDS.length ; i++){
              if(allIDS[i] === meetingID){
                bot.reply(message, 'Invalid meeting ID selected! Please try again.');
                getIDOfMeeting(response, convo);
                convo.next();
                return;
              }
            }

            confirmCancellation(response, convo);

            convo.next();
        })
    };

    var confirmCancellation = function(err, convo){
        convo.ask('Are you sure you want to deschedule this meeting?',function(response,convo) {
            var confirmation = response.text;

            if(confirmation.toUpperCase() === "YES"){
                cancelMeeting(function(isDeleted){
                  if(isDeleted){
                    bot.reply(message, 'Meeting has been descheduled');
                    delete meetingsData.meetings[meetingID];
                    fs.writeFile(MEETING_PATH, JSON.stringify(meetingsData)); // asynchronous write.
                    convo.next();
                  }else{
                    bot.reply(message, "There was some error while descheduling.");
                    convo.next();
                  }
                });
            }else{
                convo.say("Meeting was not descheduled.");
            }

            convo.next();
        })
    };

    var cancelMeeting = function(callback){
      organizer = meetingsData.meetings[meetingID].organizer;

      fs.readFile('client_secret.json', function processClientSecrets(err, content) {
          if (err) {
              console.log('Error loading client secret file: ' + err);
              return;
          }
          authorizeAndDelete(JSON.parse(content), function(isDeleted){

            callback(isDeleted);

          });
      });
    };

    function authorizeAndDelete(credentials, callback) {
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
                oauth2Client.credentials = allData.users[organizer];
                deleteEvent(oauth2Client, function(isDeleted){
                  callback(isDeleted);
                });
            }
        });
    }

    function deleteEvent(auth, callback) {
        var calendar = google.calendar('v3');
        calendar.events.delete({
            auth: auth,
            calendarId: 'primary',
            eventId: meetingsData.meetings[meetingID].eventID
        }, function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                callback(false);
            }
            callback(true);
        });
    }

    // start a conversation with the user.
    bot.startConversation(message, getIDOfMeeting);

    bot.reply(message, "Let us cancel the meeting.");
});

controller.hears(['^Authorize$', '^Authorise$','^Auth$'],['mention', 'direct_mention','direct_message'], function(bot,message) {
    var user;
    var code;
    var getIDOfUser = function(err, convo){


        /*
         convo.ask('May I know your email ID please?',function(response,convo) {
         user=response.text;
         if(user.indexOf('mail') > -1) {
         bot.reply(message,'Sorry email id is invalid. Please try again.');
         convo.next();
         return;
         }
         user = user.substring(8);
         var temp;
         temp=user.split('|');
         user=temp[0];
         console.log("user "+user);*/

        var user;

        bot.api.users.info({user:message.user}, (error, response) => {
            if(error){
                console.log('error!');
            }
            console.log(response.user.profile.email);
        user=response.user.profile.email;
        console.log("user here "+user);

        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }

            authorize(JSON.parse(content), user, err,convo,function(){
                // bot.reply(message,"Successfully authorised");
                convo.next();
            });

        });

        convo.next();
    });



        convo.next();       };

    function authorize(credentials, user,err,convo, callback) {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);



        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function(err, fileData) {
            if (err) {
                getNewToken(oauth2Client, user,err,convo, callback);
            } else {
                var allData = JSON.parse(fileData);
                if(!allData.users.hasOwnProperty(user)){
                    getNewToken(oauth2Client, user,err,convo, callback);
                }else{
                    oauth2Client.credentials = allData.users[user];
                    bot.reply(message,'You are already authorised');
                    callback(user, oauth2Client);
                }
            }
        });
    }
    function getNewToken(oauth2Client, user,err,convo, callback) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });

        convo.ask('Hi '+user+' , Kindly visit this url : '+authUrl+'  and Enter the code from that page here and then kindly return to channel #general:',function(response,convo) {
            code = response.text;
            console.log(code + 'code here');
            checkAuth(oauth2Client,code,user, err,convo,function(){
                //Reply(response, convo);
                convo.next();
            });

        })


    }

    var checkAuth = function(oauth2Client,code,user,err, convo,callback){
        oauth2Client.getToken(code, function(err, token) {
            console.log('user : '+oauth2Client+'    and token '+token+" anc coe"+code);
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                bot.reply(message,'Wrong credentials! Kindly try again ');
                convo.next();
                return;
            }
            oauth2Client.credentials = token;
            storeToken(user, token,err,convo,function(){
                bot.reply(message,"Successfully authorized");
                convo.next();
            });

            callback(oauth2Client);
        });

    }
    var storeToken=function(user, token,err,convo,callback) {

        if (!fs.existsSync(TOKEN_DIR)){
            try {
                fs.mkdirSync(TOKEN_DIR);
            } catch (err) {
                if (err.code != 'EEXIST') {
                    throw err;
                }
            }
        }
        console.log('token here'+token);
        var obj;
        var text;

        //check if file exists
        fs.stat(TOKEN_PATH, function(err, stat) {
            if(err == null) {//File exists
                console.log('file exists');
                fileData=fs.readFileSync(TOKEN_PATH);

                obj = JSON.parse(fileData);
                console.log("user in storeToken"+user);

                var entry = '{"' + user + '":' + JSON.stringify(token) + '}';
                obj.users = _.extend(obj.users, JSON.parse(entry));
                bot.reply(message,'authorized successfully! you can return to slack channel');
            }
            else if(err.code == 'ENOENT') {
                // file does not exist
                console.log('file not exists');
                text = '{"users": {"' + user + '":' + JSON.stringify(token) + '}}';
                obj = JSON.parse(text);
            } else {
                //ERROR
            }
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(obj));
        });
    }

    // start a conversation with the user.
    bot.startPrivateConversation(message, getIDOfUser);

    bot.reply(message, "Let us authorize you. Kindly continue with slack private conversation with me( Azra ).If you are in slack channel and not in private chat, You can see new chat on left menu bar.");
});

// //coversation to reschedule the meeting
// controller.hears(['^reschedule$'],['mention', 'direct_mention'], function(bot,message) {
//
//     var rescheduleRequestingUser = message.user;
//
//     var meetingID;
//
//     var getIDOfMeeting = function(err, convo){
//         convo.ask('May I know the meeting ID?',function(response,convo) {
//             meetingID = response.text;
//
//             // if(cancellationRequestingUser in meeting.getUsers()) //Some type of validaion required here.
//             confirmReschedule(response, convo);
//             // else
//             // convo.say("You are not authorized for this action.");
//             convo.next();
//         })
//     };
//
//     var confirmReschedule = function(err, convo){
//         convo.ask('Are you sure you want to reschedule the meeting?',function(response,convo) {
//             var confirmation = response.text;
//
//             if(confirmation.toUpperCase() === "YES"){
//                 cancelMeeting();
//                 convo.say("Meeting has been rescheduled.");
//             }else{
//                 convo.say("Meeting NOT rescheduled.");
//             }
//
//             convo.next();
//         })
//     };
//
//     var cancelMeeting = function(){
//         //
//
//     };
//
//     // start a conversation with the user.
//     //bot.startConversation(message, getIDOfMeeting);
//
//     //bot.reply(message, "Let us cancel the meeting.");
// });
