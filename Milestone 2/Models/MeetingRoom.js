/**
 * Created by Sunil on 10/16/2016.
 */
var Meeting = require('./Meeting.js');

class MeetingRoom
{

    constructor(id)
    {
        this.Id = id;
        this.Events = new Array(Meeting);
    }

    // constructor() { }
    constructor()
    {
        this.Id = -1;
        this.Events = new Array(Meeting);
    }

    getId()
    {
        return this.Id;
    }

    getEvents()
    {
        return this.Events;
    }

}