## Team Info

You can find the team info [here](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/Team%20Info.md)


### Project Presentation [link] (https://www.youtube.com/watch?v=OQJ8dXM8lkA)

#### Primary Features

The bot has three main features: it can create, update and delete meetings for a Slack team. The organizor has options of providing constraints on the max time, and date on the meeting. The bot then looks up the Google calendars of the meeting attendees and provides a suitable meeting time for them. 

##### Priority feature

Currently, the bot decides the meeting time based on two main constraints: the availability of attendees and the higher priorities that we have given to times around 10-11 am and after 2 pm, the time slots which have been found to be the most productive for software engineers. 

##### Functionalities

1. Google Calendar API authorization

Every user on the Slack team needs to authorize the access to his/her Calendar for Azra. This is done by entering '@azra auth' on any channel. This provides a link for the user on the personal chat with azra where he needs to give the private access token. This way, the user gives Calendar access to Azra.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.18.51%20PM.png "one")
<br>
![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.19.12%20PM.png "two")


2. Setting up meeting

The bot can create a meeting for a list of attendees whose calendars it has authorization to. The triggers are '@azra setup' or '@azra schedule'. The bot takes the emails of attendees, the duration, and the constraints on date and time, if any, as inputs. The bot then returns the suitable time for the team to have the meeting. The organizer can either accept or decline the meeting suggestion.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.19.55%20PM.png "three")

<br>
![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.20.20%20PM.png "four")

3. Adding a new member to a meeting

The bot can add a new member to an existing meeting. The trigger is '@azra add'. The bot asks for the new member email ID and the meeting ID to which the member has to be added to. The bot answers by either saying that the meeting has been updated or it can't add the new member because he was busy.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/add1.png "five")
<br>

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/add2.png "six")

4. Canceling a meeting

The bot can cancel a meeting with the trigger '@azra cancel'. The bot asks for the meeting ID to be cancelled. Then cancels its from the calendars of the members of the meeting.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/del1.png "seven")

<br>
####Your reflection on the development process and project

As part, of course requirement for Software Engineering course we needed to build a slack bot to address any software engineering issue.
It is always good to work on new technologies and tools. Slack is one such tool which is gaining tremendous popularity among tech companies. Clearly developing a slack bot became our preferred choice. We started our project journey with milestone design where we need to come up with one software engineering problem and the possible solution by developing a slack bot application.<br>
After initially brainstorming sessions and discussions with professor we decided to go ahead with the topic "Scheduling an effective meeting using slack bot".<br>

For milestone-1 design, we described the problem statement for a bot along with the architecture design that we were planning to use for the development process. It was a challenging task to decide what kind of design pattern can be utilized for this project since our future strategy was dependent on it. Initially, we planned to use MVC architecture design pattern but after giving much thought we decided to stick to MVVM model which perfectly suits the requirement of our project. Also, we had to decide the technology stack which was one of the important part of project.
During this phase of the milestone, we understood various aspects about the initial part for the project i.e. requirement gathering for designing a bot, understanding the problem statement and coming up with design patterns for the development of the bot etc.<br>
For milestone-2 bot, we came up with the implementation logic for bot where we used Nodejs for writing the business logic for the application and created mock json file to render mock data consisting of calendar data to slack bot. To smoothen the development process, we used trello cards to track and manage task assigned to each person.<br>
In milestone-3 Services, we implemented the service part of bot i.e. integrating google API for fetching the meeting details of the person. One of the challenging part of this milestone was to integrate google calendar with the existing application. Initially we struggled with this part but eventually after doing some proof of concept, we implemented it without any issues.<br>
For milestone-4 Deploy, we deployed the application on amazon ec2 to make bot forever running. We used ansible server script to deploy this application along with all the dependent packages required to make bot run on Amazon EC2.<br>
Overall, it’s been a great journey with lot of learning during each of the milestones of project. Throughout this project, we made use of agile methodology which was quite helpful to understand the requirement at early stages and frequent meetings helped us in reducing the errors and defects which might’ve impacted the project milestones at later stages.<br>
Apart from that we used pair programming concept during the coding phase of our project which was a successful experiment since it helped us in improving the quality of the code and reducing the defects which could have injected had there been only one developer working on that task. It also helped us in identifying the strong and weak points of the team members that made us easy to rotate the work after every milestone.<br>
In contrast to the projects we did in our respective companies which had hierarchy structure, where mostly a lead decides and others follow but in this project, each member had flexibility of putting their idea upfront and taking the lead to make it work. We had opportunity to rotate roles and experience a developments process in 
every perspective.<br>
#### Limitations and future work

1. Currently only google calendar is supported, going ahead the bot can be made to support outlook calendar and 
other such calendars used in professional business.

2. The implementation for deciding the time for the meeting is very basic. All business are not the same in terms of 
time effectiveness of team meetings. We can expose some functionality for the business system admins or managers so that
they have some flexibility over deciding which time frame can be suitable to conduct meeting as per their choice.

3. All meeting may not have similar priority. In our current implementation a meeting which is organized earlier gets 
high priority. But it may arise that in business a highly critical meeting has to be setup tomorrow and time which is
available is not at all favourable. So we can come up with some huristics and take intelligent decision based on the other
visible factors such who is organizing the meeting, how important are the attendees for the business, what does the 
goal of the meeting says etc.

4. Not all the appointments of a person will be visible in their calendar. There are some personal commitments that a person 
may be occupied with which will be not put in calendar for some reasons. We can put an additional functionality to the bot,
which the user can notify the bot personally that he or she is busy on this particular day, for example it may be like a
a doctor's apointment and ther person is busy Thursday morning entirely. Others doesn't have to know about such
personal commitments but still important for business.


5. Other trivial features which can be added to this bot without much resources
	
	a. Not always the organizer has to go through each and every step of interaction with bot to manage the meeting.
	We can give provision so that the user gives the bot all the details in one step.

	b. Provision to organized reccuring meetings such as sprint planning or daily standup.

	c. A team may not always be located at simgle geographical location. The bot can be made to look at calendar from 
	different time zones and book more than one meeting rooms. Also create a WebEx link etc and other such mundane tasks.

	d. Some meetings will have more than 10+ attendees. Not all are expected to attend such meetings. We may not 
	find such time when all these attendees are free. So we can give option for organizer to give a list of
	primary attendees and secondary attendees and many such hierarchy levels.

	e. After every meeting we can request a feedback from the attendees about how effective was the meeting and 
	if they all were favorable with the time chosen. This can assist the bot to learn and help take better 
	decisions in future.

	f. An appropriate meeting rooms also gets booked based on the size of the team meeting and where the team members are
	located in the office space. This is highly a customized feature but still provisions can be made so that bot is aware
	of such details. <br>




