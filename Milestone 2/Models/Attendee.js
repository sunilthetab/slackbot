/**
 * Created by Sunil on 10/16/2016.
 */

var Meeting = require('./Meeting.js');

class Attendee
{
    constructor(username)
    {
        this.UserName = username;
        this.Events = new Array(Meeting);
        this.EmailId = username + "@ncsu.edu";
    }

    // constructor() { }
    constructor()
    {
        this.UserName = "unknown";
        this.Events = new Array(Meeting);
        this.EmailId = "unknown@ncsu.edu";
    }

    getUserName()
    {
        return this.UserName;
    }

    getEvents()
    {
        return this.Events;
    }

}