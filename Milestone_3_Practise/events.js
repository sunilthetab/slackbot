/**
 * Created by Sunil on 11/9/2016.
 */
// var _ = require('underscore'),
//     Util = require("util"),
//     helpers = require('../lib/helpers'),
//     googleapis = require('googleapis'),
//     //CALLBACK_URL= process.env.HUBOT_URL + "/google/calendar/webhook",
//     uuid = require('node-uuid'),
//     moment = require("moment");


var events = {

    event_quickAdd: function (event) {
        // var range = moment.parseZone(event.start.dateTime || event.start.date)
        //     .twix(moment.parseZone(event.end.dateTime || event.end.date));
        // //return range.format();

    },

    event_insert: function (calendar, auth, event) {
        calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
        }, function (err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            console.log('Event created: %s', event.htmlLink);
        });
    },

    event_patch: function (event) {
        // var range = moment.parseZone(event.start.dateTime || event.start.date)
        //     .twix(moment.parseZone(event.end.dateTime || event.end.date));
        // return range.format();
    },

    event_delete: function (event) {
        // var range = moment.parseZone(event.start.dateTime || event.start.date)
        //     .twix(moment.parseZone(event.end.dateTime || event.end.date));
        // return range.format();
    }

}

module.exports = events;
