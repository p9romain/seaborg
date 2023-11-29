const { Client, GatewayIntentBits } = require("discord.js") ;
const { token, birthdays } = require("./config.json") ;
const Schedule = require('node-schedule') ;

const client = new Client(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  }
);

/*
    ====================================================================================
*/

const vendredi = new Schedule.RecurrenceRule() ;
vendredi.dayOfWeek = 5 ;
vendredi.hour = 8 ;
vendredi.minute = 0 ;

const friday_night = new Schedule.RecurrenceRule() ;
friday_night.dayOfWeek = 5 ;
friday_night.hour = 20 ;
friday_night.minute = 0 ;

let general, cacapublier, secret_channel ;
let old_channel ;
client.on("ready", () =>
  {
    general = client.channels.cache.get("850043957597700186") ;
    cacapublier = client.channels.cache.get("887360643747962940") ;
    secret_channel = client.channels.cache.get("1175043351746199553") ;

    old_channel = general ;

    console.log("Ready") ;
  }
) ;

client.login(token) ;

/*
    ====================================================================================
*/

// Nous sommes vendredi
Schedule.scheduleJob(vendredi, () =>
  {
    general.send(
      { 
        content : "Merci Manu.", 
        files : ["./files/vendredi.png"] 
      }
    ) ;
  }
) ;

// It's Friday night !
Schedule.scheduleJob(friday_night, () =>
  {
    general.send(
      { 
        content : "# <a:sea_fridaynight1:945779538519015424><a:sea_fridaynight2:945779540129611786> Time to dance !! <a:sea_fridaynight1:945779538519015424><a:sea_fridaynight2:945779540129611786>",
        files : ["./files/friday_night.mp4"] 
      }
    ) ;
  }
) ;

// EH OUI LE 7 DECEMBRE
Schedule.scheduleJob("0 12 7 12 *", () =>
  {
    cacapublier.send(
      { 
        content : ":hamburger: **EH OUI** :hamburger:",
        files : ["./files/eh_oui.mp4"] 
      }
    ) ;
  }
) ;

// Birthdays
birthdays.forEach( (birthday) =>
  {
    Schedule.scheduleJob(("30 9 " + birthday.date + " *"), () => 
      {
        let users = "" ;
        birthday.ids.forEach( (username) =>
          {
            users += " @" + username ;
          }
        ) ;

        console.log("Anniv(s) de : " + birthday.comment + '(' + birthday.date + ')') ;

        general.send(":index_pointing_at_the_viewer:" + users + "\n:palm_up_hand::birthday: \n \n:clap::clap: @1175043441273606144 :clap::clap: ") ;
      }
    ) ;
  }
) ;

// TALK MY CHILD !!!!
client.on("messageCreate", message =>
  {
    if ( message.channel === secret_channel )
    {
      const msg = message.content.split(' ') ; // whole message
      let channel ;
      let start ;

      if ( msg[0].slice(0, 2) === "<#" && msg[0].slice(-1) === '>' )
      {
        let channel_id = msg[0].slice(2, -1) ; // channel id : <#channel_id>
        channel = client.channels.cache.get(channel_id) ; // get channel

        old_channel = channel ; // set to the new channel used

        start = 1 ;
      }
      else
      {
        channel = old_channel ; // use the old channel used

        start = 0 ;
      }

      const text = msg.slice(start, msg.length).join(' ') ; // text to send
      const attachments = message.attachments ;
      // text, with or without attachements
      if ( text )
      {
        // with attachement
        if ( attachments.size )
        {
          let files = []
          attachments.forEach( (file) =>
            {
              files.push(file) ;
            }
          ) ;
          channel.send(
            {
              content : text,
              files : files
            }
          ) ;
        }
        // without attachement
        else
        {
          channel.send(text) ;
        }
      }
      // just attachements
      else if ( attachments.size )
      {
        let files = []
        attachments.forEach( (file) =>
          {
            files.push(file) ;
          }
        ) ;
        channel.send(
          {
            content : "",
            files : files
          }
        ) ;
      }
    }
  }
) ;

// Answer to ping
client.on("messageCreate", message =>
  {
    if ( message.content.includes("<@1177684802036576456>") )
    {
      if ( message.author.id === "336237642574200834" )
      {
        message.channel.send("fdp ne me ping pas stp") ;
        message.channel.send("<:sea_pakontan:945802134803345459>") ;
      }
      else
      {
        message.channel.send("Je vous prie de bien vouloir arrêter de me \"ping\", comme disent les jeunes. :heart::call_me:") ;
      }
    }
  }
) ;