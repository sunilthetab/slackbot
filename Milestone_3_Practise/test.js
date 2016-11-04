var _ = require('underscore');

var text = '{"users": {"gverma": {"name":"John Johnson","street":"Oslo West 16","phone":"555 1234567"}, "sohan" : {"name":"John Johnson","street":"Oslo West 16","phone":"555 1234567"}}}';

var obj = JSON.parse(text);

obj.users = _.extend(obj.users, {"sunil":{"name":"John Johnson","street":"Oslo West 16","phone":"555 1234567"}});
console.log(obj);

console.log(JSON.stringify(obj));

console.log(obj.users["sunil"]["name"]);
