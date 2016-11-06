var _ = require('underscore');
var fs = require('fs');
var readline = require('readline-sync');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    //process.env.USERPROFILE) + '/.credentials/';
    process.env.USERPROFILE) + '/Azra_MeetingBot/Milestone_3_Practise/';
var TOKEN_PATH = TOKEN_DIR + 'store.json';

/**var CAL_DIR = (process.env.HOME || process.env.HOMEPATH ||
    //process.env.USERPROFILE) + '/.credentials/';
    process.env.USERPROFILE) + '/Azra_MeetingBot/Milestone_3_Practise/';
var CAL_PATH = CAL_DIR + 'cal.json';
console.log(TOKEN_PATH); **/

// Load client secrets from a local file.
function manageData(user){
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API.
  authorize(JSON.parse(content), user, listEvents);
});
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, user, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, fileData) {
    if (err) {
      getNewToken(oauth2Client, user, callback);
    } else {
      var allData = JSON.parse(fileData);
      if(!allData.users.hasOwnProperty(user)){
        getNewToken(oauth2Client, user, callback);
      }else{
        oauth2Client.credentials = allData.users[user];
        callback(oauth2Client, user);
      }
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, user, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Kindly ask ' + user + ' to authorize this app by visiting this url: ', authUrl);

  var code = readline.question('Enter the code from that page here: ');

  oauth2Client.getToken(code, function(err, token) {
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
    oauth2Client.credentials = token;
    storeToken(user, token);
    callback(oauth2Client, user);
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(user, token) {

  if (!fs.existsSync(TOKEN_DIR)){
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
  }

  var obj;
  var text;

  var fileExists = fs.existsSync(TOKEN_PATH);

  if(fileExists){
    //File exists
    var fileData = fs.readFileSync(TOKEN_PATH);
    obj = JSON.parse(fileData);
    var entry = '{"' + user + '":' + JSON.stringify(token) + '}';
    obj.users = _.extend(obj.users, JSON.parse(entry));
  }else{
    //File does not exist
    text = '{"users": {"' + user + '":' + JSON.stringify(token) + '}}';
    obj = JSON.parse(text);
  }

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(obj));
}

/**function storeCal(user, start, end, event) {

  if (!fs.existsSync(CAL_DIR)){
    try {
      fs.mkdirSync(CAL_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
  }

  var obj;
  var text;

  var fileExists = fs.existsSync(CAL_PATH);

  if(fileExists){
    //File exists
    var fileData = fs.readFileSync(CAL_PATH);
    obj = JSON.parse(fileData);
    var entry = '{"' + user + '": "'+ start +"|" + end + "|"  + event.summary +'"}';
    obj.users = _.extend(obj.users, JSON.parse(entry));
  }else{
    //File does not exist
    text = '{"users": {"' + user + '": "'+ start +"|" + end +"|" + event.summary +'"}}';
    obj = JSON.parse(text);
  }

  fs.writeFileSync(CAL_PATH, JSON.stringify(obj));
} **/

function listEvents(auth, user) {
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found for user: ' + user + '.');
    } else {
      console.log('Upcoming 10 events of ' + user + ':');
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        var end= event.end.dateTime || event.end.date;
        console.log('%s - %s - %s', start, event.summary,end);
        //storeCal(user, start, end, event);
      }
    }
  });
  console.log();
}

manageData('gverma');
manageData('gautam94verma');
manageData('sunil');
manageData('pranav');
