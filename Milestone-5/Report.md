<h1>Azra Bot</h1> 
#### This is a slack Chat-bot which is developed as a project requirement for the coursework of 'CSC-510' under the guidance of Professor Dr. Parnin.

## Team Info

 Team Members:

1. Pranav Firake; ppfirake@ncsu.edu
2. Ajay Chandra Pendyala; apendya@ncsu.edu
3. Sohan Kunkerkar; sakunker@ncsu.edu
4. Gautam Verma; gverma@ncsu.edu
5. Sunil Narasimhamurthy; snarasi5@ncsu.edu

## Important Links
* Milestone 1: [DESIGN] (https://github.ncsu.edu/gverma/Azra_MeetingBot/tree/master/Milestone%201) 
* Milestone 2: [BOT] (https://github.ncsu.edu/gverma/Azra_MeetingBot/tree/master/Milestone%202) 
* Milestone 3: [SERVICE] (https://github.ncsu.edu/gverma/Azra_MeetingBot/tree/master/Milestone_3) 
* Milestone 4: [DEPLOY] (https://github.ncsu.edu/gverma/Azra_MeetingBot/tree/master/Milestone-4) 
* Milestone 5: [REPORT] (https://github.ncsu.edu/gverma/Azra_MeetingBot/tree/master/Milestone-5) 

</br>
### Project Presentation
* [Screencast] (https://www.youtube.com/watch?v=OQJ8dXM8lkA)


# REPORT

## 1. The problem your bot solved

The challenge here was to schedule a meeting efficiently at an optimal timing at which full attendance of all the team members is most probable. According to the empirical software analysis, the effectiveness of scrum meetings in today’s agile era depends on collaboration and contribution of each and every team mate. For solving the problem of no-shows or bad-time meetings, we developed a slack chat bot which returns the most convenient time for the team members and thereby assuring their availability while avoiding the tax of manual meeting setup.

Azra bot finds the optimal timing based on following factors:

1.	Each team member is free at that particular time slot
2.	This time slot lies in office work hours i.e. 9 AM to 5 PM
3.	Priorities are given to each time slot such as: Meetings at lunch time should be avoided so they would have lowest priority.
Meetings in early morning should be avoided as employees might be sleepy.
Meetings in afternoon excluding lunch time slot should be given more priority as maximum constructive work is performed during these hours.

Accordingly we have assigned the priorities to each timeslot. So Azra bot will return the most recent time-slot for which all the team members are available and the slot has highest priority. It also takes care that the meeting-hours perfectly fit in schedule and meetings conclude before end of working hours.

This optimal scheduling ensures that:

- Meeting attendees are available at that time slot

- Attendees will be pro-active and this will ensure effectiveness of meetings.

In agile methodology, stand-up meetings, weekly/monthly meetings play very important for success of the project. It has been analyzed that ‘Ineffective meetings’ is one the top four reasons for failure of agile methodology in projects. So with this Azra bot and thereby scheduling meetings at optimal time slot, we can overcome this challenge.  

When we want to add particular team member to existing meeting, we have to check whether that team member is available for that time slot and if not then we must find newer time slot. Checking the availability of each and every team member is cumbersome but using Azra bot we can also add new members to existing meeting and Azra bot returns whether new members are available for that particular time-slot. If the new members are busy then we can cancel the existing meeting and reschedule so as to confirm that all the team members attend the meeting. This functionality of Azra bot also solved and reduced the efforts of manual lookup into every team members’ calendars to find free time.

To summarize, Azra bot solves challenges in: 

- Finding optimal time when team members are available and are highly productive.

- Adjusting or updating the time slot when we add new member to existing meeting and she is unavailable for that particular time-slot.

- Scheduling the meetings directly into google calendars of team members. (Automation of scheduling meetings)

- Cancelling or updating meetings directly into google calendars of team members. (Automation of updating meetings)


## 2. Primary Features

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
## 3. Our reflection on the bot development process 

As part of course requirement for Software Engineering, we needed to build a slack bot to address any software engineering issue.
It is always good to work on new technologies and tools. Slack is one such tool which is gaining tremendous popularity among tech companies. Clearly developing a slack bot became our preferred choice. We started our project journey with milestone design where we need to come up with one software engineering problem and the possible solution by developing a slack bot application.<br>
After initially brainstorming sessions and discussions with professor we decided to go ahead with the topic "Scheduling an effective meeting using slack bot".


For milestone-1 design, we described the problem statement for a bot along with the architecture design that we were planning to use for the development process. It was a challenging task to decide what kind of design pattern can be utilized for this project since our future strategy was dependent on it. Initially, we planned to use MVC architecture design pattern but after giving much thought we decided to stick to MVVM model which perfectly suits the requirement of our project. Also, we had to decide the technology stack which was one of the important part of project.


During this phase of the milestone, we understood various aspects about the initial part for the project i.e. requirement gathering for designing a bot, understanding the problem statement and coming up with design patterns for the development of the bot etc.


For milestone-2 bot, we came up with the implementation logic for bot where we used Nodejs for writing the business logic of the application and created mock json file to render mock data consisting of calendar data to slack bot. To smoothen the development process, we used trello cards to track and manage tasks assigned to each person.


In milestone-3 Services, we implemented the service part of bot i.e. integrating google API for fetching the meeting details of the person. One of the challenges of this milestone was to integrate google calendar with the existing application. Initially we struggled with this part but eventually after doing some proof of concept, we implemented it without any issues. Also, it was important to handle the client secret and access tokens carefully. We made sure that they were not accessible and viewable to any unauthorized user.


We had all the information about events of members in our hand but a big task infront of us was to find common time when those members are free based on the events of each individuals we get. A simple approach would have been to make Freebusy query on google calendar APIs. But this is highly tedious task since we had to do this query for each and every time frames for all users. Dropping this idea we took brute force approach to iterate through a user's free period and check if others users are free in this time. If we encounter a conflict we take a time when that conflicted user is free and compare all other users against this new found time. ALthough this seemed to be working for us, we could not settle on deciding best suitable time. We scapped this approach entirely and decided to stick to basics of mapping calendar against events. We made a calendar structure and mapped when all the users are free. We iterated thorugh every users and mapped this calendar structure against his/her events. Finally we had an array structre showing all the free times. Next task was to simply take decision on which time is best to fix the meeting based on the priority order which we pre decided. We made this algorithm implementation flexible enough to incorporate variable office working hours, different settings given by meeting organizer and provision for weekends. This was a minor blip but we were able successfully overcome this as a team.


For milestone-4 Deploy, we deployed the application on Amazon EC-2 to make the bot forever running. We used ansible server script to deploy this application along with all the dependent packages required to make bot run on Amazon EC2.


Overall, it was been a great journey with lot of learning during each of the milestones of project. Throughout this project, we made use of agile methodology which was quite helpful to understand the requirement at early stages and frequent meetings helped us in reducing the errors and defects which might’ve impacted the project milestones at later stages. Apart from that, we used pair programming during the coding phase of our project which was a successful experiment since it helped us in improving the quality of the code and eleiminating the bugs/defects which might have got neglected had there been only one developer working on that task. It also helped us in identifying the strong and weak points of the team members that made us easy to rotate the work after every milestone.

In contrast to the projects we did in our respective companies, which had hierarchical structure where mostly the team lead decides and others follow, we felt that each member in this project had flexibility of putting their idea upfront and taking the lead to make it work. We had opportunity to rotate roles and experience a developments process in every perspective.


## 4.  Limitations and future work

1. Currently only google calendar is supported. In future, the bot can be made to support outlook calendar and 
other such calendars used in professional environment(s).

2. We believe that the implementation for deciding the time of the meeting can be further optimized. Moreover, not all businesses or teams are the same in terms of time effectiveness of the meetings. We can expose some functionality for the business system admins or managers so that they have some flexibility over deciding which time frame can be suitable to conduct meeting as per their choice.

3. All meetings may not have similar priority. In our current implementation a meeting which is organized earlier gets 
high priority. But it may arise that in business a highly critical meeting has to be setup tomorrow and time which is
available is not at all favourable. So we can come up with some heuristics and take intelligent decision based on the other
visible factors such as who is organizing the meeting, how important are the attendees for the business, what does the 
goal of the meeting says etc.

4. Not all the appointments of a person will be visible in their calendar. There are some personal commitments that a person 
may be occupied with which can not be captured in calendar for some reasons. We can put an additional functionality to the bot,
which the user can notify the bot personally that he or she is busy on this particular day, for example it may be like a doctor's apointment and the person is busy Thursday morning entirely. Others don't have to know about such personal commitments but still important for business.


5. Other trivial features which can be added to this bot without much resources
	
	a. Not always the organizer has to go through each and every step of interaction with bot to manage the meeting.
	We can give provision so that the user gives the bot all the details in one step.

	b. Provision to organized reccuring meetings such as sprint planning or daily standup.

	c. A team may not always be located at a single geographical location. The bot can be made to look at calendar from 
	different time zones and book more than one meeting room. Also create a WebEx link etc and other such mundane tasks.

	d. Some meetings will have more than 10+ attendees. Not all are expected to attend such meetings. We may not 
	find such time when all these attendees are free. So we can give option for organizer to give a list of
	primary attendees and secondary attendees and many such hierarchy levels.

	e. After every meeting we can request a feedback from the attendees about how effective was the meeting and 
	if they all were favorable with the time chosen. This can assist the bot to learn and help take better 
	decisions in future.

	f. An appropriate meeting rooms also gets booked based on the size of the team meeting and where the team members are
	located in the office space. This is highly a customized feature but still provisions can be made so that bot is aware
	of such details. 
