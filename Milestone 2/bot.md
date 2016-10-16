

### Use Cases
The functionality of the bot can be divided into three basic use cases.

```
Use case 1: Setting up a meeting

1 Preconditions
   User must have google calendar api tokens in setup in the system.

2 Main Flow
   User will request bot to create a meeting and provides list of attendees, date and duration. [S1]. The bot finds 
   the most suitable time and place for meeting and waits for confirmation from the user [S2]. Upon confirmation the
   bot creates the meeting and posts link[S3].

3 Sub flows
•	[S1] User 1 will alert the bot. Bot requests for the list of attendees which the user provides 
  (User provides /meeting command with @username1, @username2 list). The user will provide meeting 
  duration and date of the meeting upon bot’s request (Eg. 1 hour, tomorrow).
•	[S2] The bot finds the most suitable time and location for the meeting and sets up the meeting 
  at the most feasible time as per instructions as waits for confirmation from the user.
•	[S3] Upon confirmation the bot creates the meeting and send emails/posts link.

4 Alternative Flows
  [E1] Not able to find suitable because no team members are available or all meeting rooms are booked

```


```
Use case 2: Add a member to the meeting

1 Preconditions
   User must have google calendar api tokens in setup in the system and there should be a meeting scheduled already.

2 Main Flow
   User will notify bot that he wants to add a new set of attendees to the meeting [S1]. The bot adds this new set of
   members to the already created meeting and notify all the attendees [S2].

3 Sub flows
•	[S1] The user will tell the bot that he wants to add a new member or a set of members to the meeting which was created
  earlier. He provides the username of these new attendees. (Eg. Add a new member. @username 3, username 4)
•	[S2] The bot adds this single member or these members and notify all relevant members.

4 Alternative Flows
  [E1] Not able to adjust this new member into the meeting because of the schedule clash. Notify the user
  that the meeting has to rescheduled.

```



```
Use case 3: Rescheduling/Cancelling the meeting

1 Preconditions
There should be a meeting scheduled already.

2 Main Flow
   User will request bot to reschedule to a later date or cancel meeting and gives appropriate reason [S1]. The bot 
   cancels the meeting and notify all the relevant members [S3].

3 Sub flows
•	[S1] The user will tell the bot that he wants to reschedule the meeting to another date or cancel the meeting and
  gives reason for his change of mind.
•	[S2] The bot finds the most suitable time and location for the meeting for this new date or cancels the meeting 
  and notify all relevant members.


4 Alternative Flows
  [E1] Not able to reschedule the meeting so leading to ultimately cancel the meeting.

```
