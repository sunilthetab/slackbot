
####Limitations and future work

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


