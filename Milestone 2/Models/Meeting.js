/**
 * Created by Sunil on 10/16/2016.
 */

var Attendee = require('./Attendee.js');
var MeetingRoom = require('./MeetingRoom');

class Meeting
{
    // constructor() { }

    constructor()
    {
        this.Id = -1;
        this.Agenda = "";
        this.Date = 0;
        this.Month = 0;
        this.StartTime = 0;
        this.EndTime = 0;
        this.Duration = 0;

        this.MeetingRoom = new MeetingRoom();
        this.Attendees = new Array(Attendee);
    }

    constructor(id)
    {
        this.Id = id;
        this.Agenda = "";
        this.Date = 0;
        this.Month = 0;
        this.StartTime = 0;
        //this.EndTime = 0;
        this.Duration = 0;

        this.MeetingRoom = new MeetingRoom();
        this.Attendees = new Array(Attendee);
    }

    addAttendee(attendee)
    {
        if(typeof attendee === 'String')
        {
            this.Attendees.add(new Attendee(attendee));
        }
        this.Attendees.add(attendee);
    }

    setMeetingRoom(meetingRoom)
    {
        if(typeof meetingRoom === 'String')
        {
            this.MeetingRoom = new MeetingRoom(meetingRoom);
        }
        this.MeetingRoom = meetingRoom;
    }

    getEndTime()
    {
        return this.StartTime + this.Duration;
    }

}