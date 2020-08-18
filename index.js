var irc = require('irc');
var config = require('./config.json');
var needle = require('needle');

var options = {
  user_agent: 'tyserpagebot v2.0; Message @tya on slack for issues/concerns'
};

const regex = /(https?.*) \* (.*) \*/;

var client = new irc.Client(
  config.ircserver,
  config.nick,
  {
    channels:[
      "#rc",
      "#discussionsfeed"
    ],
    retryCount: 15,
    userName: "tybot",
    realName: "ty's userpage bot thing 2",
    debug:false,
    autoConnect: true,
    stripColors: true,
    port:config.ircport
  }
);

client.addListener("error", function(message) {
  console.error("ERROR: %s: %s", message.command, message.args.join(" "));
});

client.addListener('message#discussionsfeed', function (from, to, message) {
    //console.log('discussionsfeed: ' + from + ' => ' + to + ': ' + message);
    return;
    message = message.args[1];
    console.log(message);
    try {
      var parsed = JSON.parse(message);
      var user = parsed.userName;
      var url = parsed.url;

      needle('post', config.userpagesite + '/api/create/',
            { // form data
              user: user,
              url: url,
              apikey: config.apikey
            },
            options
          ).then(function(response) {
            console.log(response.body);
          }).catch(function(err) {
            console.error(err.body);
          });

      console.log(user + " at " + url);
    } catch (e) {
      if(e instanceof SyntaxError) {
        // invalid json
        console.log("invalid json");
        return;
      } else {
        console.error(e);
        return;
      }
    }
});

client.addListener('message#rc', function (from, to, message) {
    message = message.args[1]; // get the text
    var match = regex.exec(message);

    if(match == null) {
      // ucp logs don't match because no urls, so don't know where they are anyway
      console.log("does not match");
      console.log(message);
      return;
    }

    var user = match[2];
    var url = match[1];

    needle('post', config.userpagesite + '/api/create/',
          { // form data
            user: user,
            url: url,
            apikey: config.apikey
          },
          options
      ).then(function(response) {
        console.log(response.body);
      }).catch(function(err) {
        console.error(err.body);
    });
    //console.log('rc: ' + from + ' => ' + to + ': ' + message);
});

client.addListener('pm', function(nick, message) {
    console.log('Got private message from %s: %s', nick, message);
});
