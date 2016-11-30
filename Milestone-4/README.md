## Team Info

You can find the team info [here](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/Team%20Info.md)

## Deployment scripts:

We have deployed Azra-bot to Amazon-EC2 instance and for this we have used following deployment scripts:

#### [setup.yml](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/Milestone-4/setup.yml)
#### [startbot.yml](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/Milestone-4/startBot.yml)


## Screencast Videos:
  
  Please find the deployment to Amazon EC2 in following video: 
###   [Deployment video](https://www.youtube.com/watch?v=nfDORZ-Zbnw)

 Please find the bot interaction when bot is running in following video: 
###   [Bot video](https://www.youtube.com/watch?v=c-sT3V_JcFI)


## Task Tracking :

  Please find the task tracking at 
      [WORKSHEET](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/Milestone-4/WORKSHEET.md)


## Acceptance Tests

Purpose of bot: Purpose of bot is to find optimal timing for meeting among the users in the slack group. For a person to use this functionality, she/he must be slack team member and her/his calendar details are taken from her email-id used for signing up slack team through Google OAuth.

We have deployed the chat bot to slack channel- this https://azrabot.slack.com/
We have made 3 dummy users :

      1.UserID: azra.mem.one@gmail.com Password: azra1234  Slack_Username: dummy.one
      
      2.UserID: azra.mem.two@gmail.com Password: azra1234  Slack_Username: dummy.two
      
      3.UserID: azra.mem.three@gmail.com Password: azra1234  Slack_Username: dummy.three
      
      1.UserID: azra.ta.one@gmail.com Password: azra1234  Slack_Username: ta.one

Kindly log in to this channel using any of the above credentials. And one can check the calendars of these dummy users through the same userid and passwords. 
Please find google-calendars at https://calendar.google.com/



## General Instructions before making the meeting

A. The TA's account hasn't authorised access to its calendar. This must be done first, by entering '@azra auth' in the personal chat with 'azra'.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.18.51%20PM.png "one")

B. Go to the link provided and enter the secret token from it.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.19.12%20PM.png "two")

C. You're authorised now and can go ahead with the usecases.


## USE CASE 1: Create a new meeting


Instructions:

A. Enter '@azra setup' or '@azra schedule' in the channel.
B. Enter the email IDs of the attendees. (eg: azra.mem.one@gmail.com). Separate the addresses by one space.
C. Provide the approx duration of the meeting. (eg, 1 or 2 or 1:30 etc.)
D. Provide the max date by which you need the meeting to be made. ( eg: 12/23, 12/23/2016 or NA if, not applicable)
E. Provide the max time in the day by which the meeting should be made. (eg: 18 or NA if, not applicable)

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.19.55%20PM.png "three")

F. The bot would give a suitable response regarding the meeting, either it has found a time or it hasn't.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/Screen%20Shot%202016-11-29%20at%207.20.20%20PM.png "four")

G. Provide a 'yes' if you want to confirm the meeting or a 'no' if you don't want it to make the meeting.
H. You can check the meeting created for the members in their google calendars.


### USE CASE 2: Add a new member to an existing meeting

Instructions:

A. Enter '@azra add' in the channel.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/add1.png "five")

B. This will provide the list of meetings to choose from.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/add2.png "six")

C. Enter ONLY the meeting ID to be updated. (0,1, or 2 etc.)
D. Enter the new attendee(s) email ID. (eg: azra.mem.one@gmail.com). Separate the addresses by one space.
E. The bot will either add the members to the meeting or say that the new members are busy. You can continue without the users or you can create a meeting with them.


### USE CASE 3: Cancel a meeting

Instructions:

A. Enter '@azra cancel' or '@azra deschedule' in the channel.

![image](https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/images/del1.png "seven")

B. This will provide the list of meetings to choose from.<br>
C. Enter ONLY the meeting ID to be deleted. (0, OR 1, OR 2 etc.)<br>
D. Answer if you'd surely like to delete the meeting.<br>
E. The bot will provide a suitable response.

