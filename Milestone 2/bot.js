
var Botkit = require('botkit');

var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
  //token: process.env.ALTCODETOKEN,
  token: 'xoxb-87992197655-VxQuZsKc2LDrur8ENZNwiKT6',
}).startRTM()

//coversation begins here
controller.hears(['schedule', 'setup'],['mention', 'direct_mention'], function(bot,message) {
  var approxMeetingDuration_Hours = 0;
  var approxMeetingDuration_Mins = 0;

  //Contains all email ids
  var arrayID;

  var byTime_Hour;
  var byTime_Minute;

  var byDate;
  var byMonth;
  var byYear;

  var getIDOfAttendees = function(err, convo){
    convo.ask('Alright. May I know the email IDs of the attendees, please?',function(response,convo) {
      var IDofAttendees = response.text;
      //
      convo.say('Cool, you said: ' + response.text);

      var arrayID = IDofAttendees.split(" ");
      if(IDofAttendees.indexOf(',') > -1){
        arrayID = IDofAttendees.split(",");
      }
      for(var i = 0 ; i < arrayID.length ; i++){
        arrayID[i] = arrayID[i].trim();
      }

      getApproxMeetingDuration(response, convo);
      convo.next();
    });
  };

  var getApproxMeetingDuration = function(err, convo){
    convo.ask('OK. What will be the approximate duration of the meeting (HH:MM or HH)?',function(response,convo) {
      var approxMeetingDuration = response.text;

      var approxDurationArray = approxMeetingDuration.split("");
      if(approxMeetingDuration.indexOf(":") > -1){
        approxDurationArray = approxMeetingDuration.split(":");
      }

      approxMeetingDuration_Hours = parseInt(approxDurationArray[0]);
      if(approxDurationArray.length == 2){
        approxMeetingDuration_Mins = parseInt(approxDurationArray[1]);
      }

      //check if valid email addresses are entered

      getLastDateOrDay(response, convo);
      convo.next();
    });
  };

  var getLastDateOrDay = function(err, convo){
    convo.ask('And by what date(MM/DD/YYYY or MM/DD or DD) or day do you want the meeting to be scheduled?',function(response,convo) {
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

      convo.say("i got " + byDate + " " + byMonth + " " + byYear);

      getLastTime(response, convo);

      convo.next();
    });
  };

  var getLastTime = function(err, convo){
    convo.ask('OK. By what time (HH:MM or HH) should the meeting be organized (24 Hour format)?',function(response,convo) {
      lastTime = response.text;

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
        // console.log(approxMeetingDuration_Hours + " " + approxMeetingDuration_Mins);
        var meetingDurationInMin = approxMeetingDuration_Hours * 60 + approxMeetingDuration_Mins;
        // console.log(meetingDurationInMin);
        var timeLeftInMin = (new Date(1900 + byYear, byMonth, byDate, byTime_Hour, byTime_Minute, 0, 0) - new Date()) / (1000 * 60);
        // console.log(new Date(1900 + byYear, byMonth, byDate, byTime_Hour, byTime_Minute, 0, 0));
        // console.log(new Date());
        convo.say("Time Left: " + timeLeftInMin);
        if(timeLeftInMin < meetingDurationInMin){
          HandleInsufficientTime(response, convo);
          convo.next();
          return;
        }
      }

      convo.say("i got " + " " + byTime_Hour + " " + byTime_Minute);

      convo.next();
    });
  };

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


  bot.reply(message, "voila");

});
