
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
  var IDofAttendees;
  var approxMeetingDuration;
  var lastDateTime;

  var getIDOfAttendees = function(err, convo){
    convo.ask('Alright. May I know the email IDs of the attendees, please?',function(response,convo) {
      IDofAttendees = response.text;
      //
      convo.say('Cool, you said: ' + response.text);
      getApproxMeetingDuration(response, convo);
      convo.next();
    });
  };

  var getApproxMeetingDuration = function(err, convo){
    convo.ask('OK. What will be the approximate duration of the meeting?',function(response,convo) {
      approxMeetingDuration = response.text;
      getLastDateTime(response, convo);
      convo.next();
    });
  };

  var getLastDateTime = function(err, convo){
    convo.ask('And by what date/time (24 hour format) do you want the meeting to be scheduled?',function(response,convo) {
      lastDateTime = response.text;

      //Contains all email ids
      var arrayID = IDofAttendees.split(" ");
      if(IDofAttendees.indexOf(',') > -1){
        arrayID = IDofAttendees.split(",");
      }
      for(var i = 0 ; i < arrayID.length ; i++){
        arrayID[i] = arrayID[i].trim();
      }
      //today's date and time
      var today = new Date();
      //user's time and date
      var dateTimeArray = lastDateTime.split(" ");
      var byDate = today.getDate();
      var byTime_Hour = 23;
      var byTime_Minute = 59;

      for(var i = 0 ; i < dateTimeArray.length ; i++){
        if(dateTimeArray[i].match(/[^A-Za-z]+/)){//contain some number in some format
          if(dateTimeArray[i].indexOf(':') > -1){
            var timeInSemiCOlonFormat = dateTimeArray[i].split(':');
            byTime_Hour = timeInSemiCOlonFormat[0];
            byTime_Minute = timeInSemiCOlonFormat[1];
          }else{
            if(parseInt(dateTimeArray[i]) < 24 && parseInt(dateTimeArray[i]) >= 0){
              byTime_Hour = dateTimeArray[i];
              byTime_Minute = 0;
            }else{
              getLastDateTime(response, convo);
              return;
            }
          }
        }else if(dateTimeArray[i].toUpperCase() === "SUNDAY"){
          byDate += today.getDay() > 0 ? 7 - today.getDay() : 7;
        }else if(dateTimeArray[i].toUpperCase() === "MONDAY"){
          byDate += today.getDay() >= 1 ? 7 - today.getDay() + 1: 1 - today.getDay();
        }else if(dateTimeArray[i].toUpperCase() === "TUESDAY"){
          byDate += today.getDay() >= 2 ? 7 - today.getDay() + 2: 2 - today.getDay();
        }else if(dateTimeArray[i].toUpperCase() === "WEDNESDAY"){
          byDate += today.getDay() >= 3 ? 7 - today.getDay() + 3: 3 - today.getDay();
        }else if(dateTimeArray[i].toUpperCase() === "THURSDAY"){
          byDate += today.getDay() >= 4 ? 7 - today.getDay() + 4: 4 - today.getDay();
        }else if(dateTimeArray[i].toUpperCase() === "FRIDAY"){
          byDate += today.getDay() >= 5 ? 7 - today.getDay() + 5: 5 - today.getDay();
        }else if(dateTimeArray[i].toUpperCase() === "SATURDAY"){
          byDate += today.getDay() >= 6 ? 7 - today.getDay() + 6: 6 - today.getDay();
        }else{

        }
      }

      convo.say("i got " + byDate + " " + byTime_Hour + " " + byTime_Minute);

      convo.next();
    });
  };

  // start a conversation with the user.
  bot.startConversation(message, getIDOfAttendees);


  bot.reply(message, "voila");

});
