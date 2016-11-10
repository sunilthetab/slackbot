//     Util = require("util"),
//     helpers = require('../lib/helpers'),
//     googleapis = require('googleapis'),
//     //CALLBACK_URL= process.env.HUBOT_URL + "/google/calendar/webhook",
//     uuid = require('node-uuid'),
//     moment = require("moment");
var _ = require('underscore'),

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

    event_patch_add_users: function (calendar, auth, eventID, emails_list) {

        //TODO: add logic to extract emailid if only username or name of users are provided.
        // now we are expecting user to input in format "apendya@ncsu.edu ppfirake@ncsu.edu"
        var emails = _.compact(_.map(_.compact(emails_list.split(' '))));

        calendar.events.get({ auth: auth,
            alwaysIncludeEmail: true,
            calendarId: "primary",
            eventId: eventID
        }, function(err, event) {
            if (err) {
                console.log('Error getting event: ' + err);
                return;
            }
            var emailsObj = _.map(emails, function (a) {
                return {email: a};
            });

            var current_emails = _.map(event.attendees, function (a) {
                return {email: a.email};
            });
            var emailUnion = _.union(emailsObj, current_emails);

            calendar.events.patch({
                auth: auth,
                calendarId: "primary",
                eventId: event.id,
                resource: {attendees: emailUnion}
            }, function (err, event) {
                if (err) {
                    console.log('Error inviting additional users: ' + err);
                    return;
                }
                console.log("Users invitation success for Event with ID: %s", event.id);
            });
        });
    },

    event_patch_remove_users: function (calendar, auth, eventID, emails_list) {
        //TODO: add logic to extract emailid if only username or name of users are provided.
        // now we are expecting user to input in format "apendya@ncsu.edu ppfirake@ncsu.edu"
        var emails = _.compact(_.map(_.compact(emails_list.split(' '))));
        calendar.events.get({ auth: auth,
            alwaysIncludeEmail: true,
            calendarId: "primary",
            eventId: eventID
        }, function(err, event) {
            if (err) {
                console.log('Error getting event: ' + err);
                return;
            }
            var emailsObj = _.map(emails, function (a) {
                return {email: a};
            });

            var current_emails = _.map(event.attendees, function (a) {
                return {email: a.email};
            });

            var emailDisjunction = [];
            for (var i = 0; i < current_emails.length; i++)
            {
                var isPresent = _.find(emailsObj, function(d){
                                 return d.email === current_emails[i].email;
                        });
                if(!isPresent)
                {
                    emailDisjunction.push(current_emails[i]);
                }
            }

            calendar.events.patch({
                auth: auth,
                calendarId: "primary",
                eventId: event.id,
                resource: {attendees: emailDisjunction}
            }, function (err, event) {
                if (err) {
                    console.log('Error inviting additional users: ' + err);
                    return;
                }
                console.log("Users invitation success for Event with ID: %s", event.id);
            });
        });
    },

    event_delete: function (calendar,auth, eventID) {
       calendar.events.delete({
           auth: auth,
           calendarId: 'primary',
           eventId: eventID,
       }, function (err, eventID) {
           if (err) {
               console.log('There was an error deleting the Event with ID: ' + err);
               return;
           }
           console.log('Event deleted  EventID: ' + eventID);
       });
   }
}

module.exports = events;
