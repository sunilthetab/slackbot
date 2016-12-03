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
	of such details.


