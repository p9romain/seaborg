const { Client, GatewayIntentBits } = require("discord.js") ;
const Config = require("./config.json") ;
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
) ;

const bot_id = "1177684802036576456" ;

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

client.login(Config.token) ;

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
client.on("ready", () =>
  {
    Config.birthdays.forEach( (birthday) =>
      {
        Schedule.scheduleJob(("30 9 " + birthday.date + " *"), () => 
          {
            let users = "" ;
            let first_names = "" ;
            birthday.users.forEach( (user) =>
              {
                users += "<@" + user.id + "> " ;
                first_names += user.comment + " " ;
              }
            ) ;

            console.log("Anniv(s) de : " + first_names + "(" + birthday.date + ")") ;

            general.send(":index_pointing_at_the_viewer:") ;
            general.send(users) ; 
            general.send("** **") ;
            general.send(":palm_up_hand::birthday:") ; 
            general.send("** **") ;
            general.send("** **") ;
            general.send(":clap::clap: <@&1175043441273606144> :clap::clap:") ;
          }
        ) ;
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
    if ( message.content.includes("<@${bot_id}>") && message.channel !== secret_channel )
    {
      if ( message.author.id === "336237642574200834" )
      {
        message.channel.send("fdp ne me ping pas stp") ;
        message.channel.send("<:sea_pakontan:945802134803345459>") ;
      }
      else if ( message.author.id !== bot_id )
      {
        message.channel.send("Je vous prie de bien vouloir arrêter de me \"ping\", comme disent les jeunes. :heart::call_me:") ;
      }
    }
  }
) ;

// Quoifeur, coubeh ; Commentdancousteau etc
client.on("messageCreate", message =>
  {
    if ( message.author.id !== bot_id && message.channel !== secret_channel )
    {
      let text = message.content.toLowerCase() ;

      if ( text.includes("goyave") )
      {
        message.channel.send("Randomisa-hmmmmm.......") ;
      }

      if ( Math.random() < Config.proba_answer_meme )
      {
        if ( text.includes("quoi ?") || text.includes("quoi?") || text.endsWith("quoi") )
        {
          if ( Math.random() < 0.5 ) 
          {
            message.channel.send("-coubeh.") ;
          }
          else
          {
            message.channel.send("Feur.") ;
          }
        }
        else if ( text.includes("comment ?") || text.includes("comment?") || text.endsWith("comment") )
        {
          message.channel.send("-dant Cousteau.") ;
        }
        else if ( text.includes("oui ?") || text.includes("oui?") || text.endsWith("oui") )
        {
          message.channel.send("-stiti.") ;
        }
        else if ( text.includes("hein ?") || text.includes("hein?") || text.endsWith("hein") )
        {
          message.channel.send("Deux.") ;
        }
      }
    }
  }
) ;

// H
client.on("messageCreate", message =>
  {
    if ( message.author.id !== bot_id && message.channel !== secret_channel )
    {
      let text = message.content.toLowerCase() ;

      if ( (text.includes(" h ") || text === 'h') && Math.random() < 0.5 )
      {
        let proba = Math.random() ;
        if ( proba < 0.25 )
        {
          message.channel.send("https://tenor.com/view/letter-h-gif-9063752") ;
        }
        else if ( proba >= 0.25 && proba < 0.5 )
        {
          message.channel.send("https://tenor.com/view/when-the-h-stock-images-funny-dance-meme-memes-gif-21772997") ;
        }
        else if ( proba >= 0.5 && proba < 0.75 )
        {
          message.channel.send("https://tenor.com/view/letter-h-h-letter-hhh-hh-h-meme-gif-22388730") ;
        }
        else
        {
          message.channel.send("https://tenor.com/view/meme-gif-20452123") ;
        }
      }
    }
  }
)