var _ = require('underscore');

var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'testing.json';

var fs = require('fs');

function getNewToken(user, callback) {
  console.log('Kindly ask ' + user + ' to authorize this app by visiting this url: ');

  var token = '{"access_token":"ya29.Ci-KA-rLhwRqcrEjU3iKDQdme_WvwPylT-V5uR-UaShEsinnODCY46GVoPt5WVeHxg","refresh_token":"1/vhJ_9-cUNiFWj7SISE7dFSYjSI4wI5sXRi2v6gZddWglh29zTlMDYy6fy88oFlqx","token_type":"Bearer","expiry_date":1478143091377}';

  storeToken(user, token);
console.log('AAAAAAAAAAa');
  // callback(oauth2Client);
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

  //check if file exists

  var fileExists = fs.existsSync(TOKEN_PATH);

  if(fileExists){
    //File exists
    var fileData = fs.readFileSync(TOKEN_PATH);
    obj = JSON.parse(fileData);
    var entry = '{"' + user + '":' + token + '}';
    obj.users = _.extend(obj.users, JSON.parse(entry));
  }else{
    //File does not exist
    text = '{"users": {"' + user + '":' + token + '}}';
    obj = JSON.parse(text);
  }

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(obj));
}

function listEvents(user, auth) {
  console.log('----NOT FOR USE----');
}

getNewToken('gverma');
getNewToken('gautam94verma');
getNewToken('sunil');
getNewToken('dsads');
