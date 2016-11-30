## Acceptance Tests


### General Instructions before making the meeting

A. The TA's account hasn't authorised access to its calendar. This must be done first, by entering '@azra_bot auth' in the personal chat with 'azra_bot'.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.18.51%20PM.png "one")

B. Go to the link provided and enter the secret token from it.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.19.12%20PM.png "two")

C. You're authorised now and can go ahead with the usecases.


### USE CASE 1: Create a new meeting


Instructions:

1. Enter '@azra setup' or '@azra schedule' in the channel.
2. Enter the email IDs of the attendees. (eg: azra.mem.one@gmail.com). Separate the addresses by one space.
3. Provide the approx duration of the meeting. (eg, 1 or 2 or 1:30 etc.)
4. Provide the max date by which you need the meeting to be made. ( eg: 12/23, 12/23/2016 or NA)
5. Provide the max time in the day by which the meeting should be made. (eg: 18 or NA)

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.19.55%20PM.png "three")

6. The bot would give a suitable response regarding the meeting, either it has found a time or it hasn't.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.20.20%20PM.png "four")

7. Provide a 'yes' if you want to confirm the meeting or a 'no' if you don't want it to make the meeting.
8. You can check the meeting created for the members in their google calendars.


### USE CASE 2: Add a new member to an existing meeting

Instructions:

1. Enter '@azra add' in the channel.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.20.42%20PM.png "five")

2. This will provide the list of meetings to choose from.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.21.03%20PM.png "six")

3. Enter the meeting ID to be updated. (0,1, or 2 etc.)
4. Enter the new attendee(s) email ID.
5. The bot will provide a suitable response.


### USE CASE 3: Cancel a meeting

Instructions:

1. Enter '@azra cancel' or '@azra deschedule' in the channel.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.21.28%20PM.png "seven")

2. This will provide the list of meetings to choose from.
3. Enter the meeting ID to be deleted.
4. Answer if you'd surely like to delete the meeting.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.21.48%20PM.png "eight")

5. The bot will provide a suitable response.


