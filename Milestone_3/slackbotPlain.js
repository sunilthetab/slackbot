var SlackBot = require('slackbots');
var botkit = require("botkit")
var childProcess = require("child_process");

// create a bot
var bot = new SlackBot({
    // Add a bot https://my.slack.com/services/new/bot and put the token
    //token: process.env.ALTCODETOKEN,
    token: 'xoxb-87992197655-VxQuZsKc2LDrur8ENZNwiKT6',
    name: 'gauti'//change with your name
});

bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    var params = {
        icon_emoji: ':cat:'
    };

    // define channel, where bot exist. You can adjust it there https://my.slack.com/services
    // define existing username instead of 'user_name'
    //bot.postMessageToUser('cjparnin', 'meow!', params);
    bot.getChannels().then(function(channels)
    {
        console.log(JSON.stringify(channels, null, 3))
    });
});

bot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm
    if( data.type == 'message' && getUser(data.user).name != bot.name )
    {
        if( data.text )
        {
            reply(data, "The weather is <none>")
        }
    }
    console.log( data )
});

function reply(data, msg)
{
    console.log( "replying to " + data.channel)
    console.log( data )
    var channel = getChannel(data.channel)
    if( channel )
    {
        console.log( "replying in channel ")
        bot.postMessageToChannel(channel.name, msg, {as_user: true});
    }
    else
    {
        var user = getUser(data.user)
        bot.postMessageToUser(user.name, msg, {as_user: true} );
    }
}

function getChannel(channelId)
{
    return bot.channels.filter(function (item)
    {
        return item.id === channelId;
    })[0];
}

function getUser(userId)
{
    return bot.users.filter(function (item)
    {
        return item.id === userId;
    })[0];
}
