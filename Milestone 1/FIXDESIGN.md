#FIX DESIGN

Team Members:

1. Pranav Firake; ppfirake@ncsu.edu
2. Ajay Chandra Pendyala; apendya@ncsu.edu
3. Sohan Kunkerkar; sakunker@ncsu.edu
4. Gautam Verma; gverma@ncsu.edu
5. Sunil Narasimhamurthy; snarasi5@ncsu.edu


## Actions suggested by Professor

1. Motivate ideal time in the problem statement
2. Provide a more high-level representation of the architecture.
3. Provide design patterns used in the project.

## The changes made

1. We have improved the problem statement and included the motivation behind the need for ideal time of meetings.
2. We've also made changes to the storyboard and the wireframe as suggested by the Professor.
3. We've provided a more high-level representation of the arhcitecture.
4. We've added the design patterns used in our project.


### Problem Statement



In engineering, agile methodologies often require frequent meetings in: daily scrums, sprint planning, backlog grooming, retrospects, sprint close-outs, demos as well as ad-hoc planning, designing, and training meetings etc. Meetings are an effective method for gathering different perspectives and discussing possible solutions. This involves scheduling and organizing team meetings which incur monetary expenses in some cases, and consensus of the team members about the location, start time, and the duration of the meeting. Though it seems a trivial task, it may cost resources whose overhead may exceeds the merit of meeting itself. Also, it is important that the timing of the meeting is ideal. Ideal time is subjective, but most studies have found that meetings held on weekdays other than Monday and Friday are effective. This is because of their proximity to the weekend. Also, people are found to be comfortable and enthusiastic about meetings held at 3pm as it is not early in the morning or not right after a meal. This gives employees enough time to prep for the meeting, and not be sluggish as its not after a meal. A meeting during the lunch time is also fine as long as meeting offers some kind of food refreshments. Coming to the to the significance of consensus within the team about a time, it can be exemplified by this; in a team of 5 people, only one person may disagree at the start time of the meeting. But having a significant and equal role in the project, the members have to reschedule the meeting.  Now, supposing everyone is busy with their work, they take more time searching for another available time and location. When they find one, say two more people are not comfortable with the location! The process continues and in the interim they waste their time and needlessly procrastinate the meeting, which in turn hinders the product development. Even when they are able to concert, it may not be on the optimal terms which further decreases their productivity and efficiency of the meeting.



###Design Sketches

We've also made changes to the storyboard and the wireframe as suggested by the Professor. 
####Storyboard

A storyboard is a graphic organizer in the form of illustrations or images displayed in sequence for the purpose of understanding the problem and its solution. Our main focus for developing this bot is to address the problem of bad meeting timings which persist in industry for long time. To avoid such conflicts and improve efficiency, business often keep meetings when their employees are more productivity. 
Below storyboard will describe the story about the meeting bot which will schedule a meeting by taking into consideration all the factors (project cost, work efficiency and productivity of the employees).


![alt text](https://github.com/suniltheta/slackbot/blob/master/Milestone%201/Storyboard_New.png)

####Wireframe
![alt text](https://github.com/suniltheta/slackbot/Azra_MeetingBot/blob/master/Milestone%201/output_HfRQ3w.gif)


###Architecture Design
Meeting bot must be connected with the calendar of every person with whom the meeting is to be scheduled and with the main user (Meeting organizer) for the purpose of getting details of meeting and delivering suitable meeting timing solutions. For this functionality, the best-suited architecture would be **Call and Return architecture with Object Oriented approach**.

####Components in architecture
![alt text](https://github.com/suniltheta/slackbot/Azra_MeetingBot/blob/master/Milestone%201/arch1.png)
Here as solution to our problem is to have a slack bot that can schedule a meeting, we have basically 3 things to consider namely a meeting coordinator, Slackbot and calendars of team members. Team coordinator requests to schedule a meeting to bot and bot replies with asking for team members to consider for this meeting. Then bot will ask for time limit to consider for this meeting and suggest a time for meeting accordingly and confirm it with team coordinator. So this is how bot will be designed.

![alt text](https://github.com/suniltheta/slackbot/Azra_MeetingBot/blob/master/Milestone%201/componenet_architecture.png)

This project involves the usage of following components:
* **Slack** - users will chat through slack;
* **Meeting Bot and Google Calendar** - the bot will get information from the calendars of team members. The main user will ask the bot to schedule a meeting which would include the name (id) of attendees, and the data/time by which the meeting is to be organized. The meeting bot will chat with the main user for any further assistance related to organizing/scheduling the meeting. It will look-up the calendars of all the attendees. These calendars will basically be the Google calendars synchronized with slack.The meeting bot will search for available (idle) time slots of attendees and would find a time when all of them are available. It will also take into consideration any specific instruction by the main user, try to find an optimistic time and location for all the team members, and minimize the cost of organizing meeting to the company. The meeting bot will then notify the main user with the details about the meeting and ask him for an approval to set-up the meeting. So, the platform for using the meeting bot will be slack, and the bot will use third-party services from google calendar.

####Class Diagram
![alt text](https://github.com/suniltheta/slackbot/blob/master/Milestone%201/class_diagram.png)

### Design Patterns
#### Space Reactor

The design pattern that our bot follows is that of space reactor bot pattern:

Space Reactors, react to incoming messages, and know where they are receiving a message. The bot has memory of the place, and will respond to the user differently depending upon where the conversation was taking place.

1. Reacts to messages on the chat service
2. Knows where its being addressed


i. The following code shows how the bot listens to the messages:

```javascript

controller.hears(['^schedule$', '^setup$'],['mention', 'direct_mention'], function(bot,message) {
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

  ```

  ii. The following spawns an instance of the bot:

  ```javascript

  // connect the bot to a stream of messages
controller.spawn({
  //token: process.env.ALTCODETOKEN,
  token: 'xcxxxxxxxxxxxxxxxxxxxxxx',
 }).startRTM()
 ```

  iii. The following example shows that the bot maintains persistent user state. The  adjustMeeting function implies that you now need to have persistent state associated with the Space. It's a matter of making sure that your reply goes to the correct place.


  ```javascript

 //coversation to add new member to a meeting
controller.hears(['^Add$', '^new$'],['mention', 'direct_mention'], function(bot,message) {
  var newAttendeeIDs;
  var meetingID;

  var getIDOfNewAttendee = function(err, convo){
    convo.ask('May I know the email IDs of the new attendees, please?',function(response,convo) {
      newAttendeeIDs = response.text.split(" ");

      getIDOfMeeting(response, convo);

      convo.next();
    })
  };

  var adjustMeeting = function(){
    //
  };

  ```

#### MVVM (Model View View-Model)

MVVM guidelines advocates to separate business logic from appearance and layout. The three main components of MVVM are Model, View and View-Model

Our bot would follow this architectural design pattern in the following way:

1. Models implement data model along with business and validation logic. The models would be attendee, meetingroom etc. 

2. View: The view by default is slack whose appearance can't be changed by us.

3. View-model: Acts as link between View and Models responsible for handling view logic. Our logic that connects slack and the backend of calendar and user data is in bot.js file.





