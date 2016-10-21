## MILESTONE 2 : BOT


## 3 Use Cases

###Please find 3 use cases in following file
####https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/Milestone%202/Use%20Cases.md

## Mocking

  For meeting-bot, we will use the Google Calendar API. For this milestone, we have mocked the google calendar data using JSON objects. We have created JSON file based on users' calendars and we are storing her/his status about availability (busy/available) into it. This JSON consists of users names and meeting rooms. And we have mocked this data and used in our bot.js for read and write purpose. Here we have used array to store slots of user's calendar and availability for each date. We have imported this mocked JSON into bot.js file and bot can also write to this mocked file.
  When meeting is scheduled, we are saving the meeting ID, its time slot and users attending this meeting in mock JSON file. It will be deleted when user deletes meeting and new record is added when user schedules a new meeting.

  Please find mock.json file here
  https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/Milestone%202/mock.json

## Bot Implementation

  Azra bot is a meeting bot that schedules a meeting for specified users. It checks calendars of such users through mock.json and returns the free time of users and asks meeting-coordinator to confirm meeying timing and schedules accordingly.
  Please find bot.js and other files below
  https://github.ncsu.edu/gverma/Azra_MeetingBot/tree/master/Milestone%202


## Selenium testing of each use case

  Please find selenium test script for each use case below :
	https://github.ncsu.edu/gverma/Azra_MeetingBot/tree/master/Milestone%202/Selenium_Test  

## Task Tracking -- WORKSHEET.md

  For task tracking we have used "Trello" cards.
  Please find worksheet at https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/WORKSHEET.md

## Screencast

  Please download the screencasts using the links below:

  Use Case 1: https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/Milestone%202/screencasts/usecase_1.mp4?raw=true

  Use Case 2: https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/Milestone%202/screencasts/usecase_2.mp4?raw=true

  Use Case 3: https://github.ncsu.edu/gverma/Azra_MeetingBot/blob/master/Milestone%202/screencasts/usecase_3.mp4?raw=true
