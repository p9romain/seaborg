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

const fillers = "(-|_|,|;|\\.|\\?|!|#|\\||=|\\+|°|%|\\$|£|\\*|'|\"|§|<|>|\\^)*" ;

function word_to_regex(text, can_be_interogative = true, start_end = true)
{
  let interr = can_be_interogative ? "?\\?" : "" ;
  let word = "" ;

  for ( const char of text )
  {
    word += char + '+' + fillers ;
  }

  if ( start_end )
  {
    return new RegExp("(^|\\s)" + word + "($|\\s" + interr + ")", "ui") ;
  }
  else
  {
    return new RegExp(word, "ui") ;
  }
}

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
let old_channel, is_deux_sent ;

client.on("ready", () =>
  {
    general = client.channels.cache.get(Config.general_id) ;
    cacapublier = client.channels.cache.get(Config.cacapublier_id) ;
    secret_channel = client.channels.cache.get(Config.secret_channel_id) ;

    old_channel = general ;
    is_deux_sent = false ;

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
        content : "_Merci Manu._", 
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
Schedule.scheduleJob("0 * 7 12 *", () =>
  {
    if ( Math.random() < Config.proba_burger )
    {
      cacapublier.send(
        { 
          content : "# :hamburger: EH OUI :hamburger:",
          files : ["./files/eh_oui.mp4"] 
        }
      ) ;
    }
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
            general.send(`:clap::clap: <@&${Config.birthday_role}> :clap::clap:`) ;
          }
        ) ;
      }
    ) ;
  }
) ;


client.on("messageCreate", message =>
  {
    if ( message.channel === secret_channel )
    {
      if ( message.content === "@stop" )
      {
        console.log("Stop") ;
        process.exit(0) ; 
      }
      // TALK MY CHILD !!!!
      else
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
    else if ( message.author.id !== Config.bot_id )
    {
      // Un, deux, trois, soleil !
      if ( is_deux_sent && word_to_regex("trois", can_be_interogative = false, start_end = false).test(message.content) )
      {
        message.channel.send("Soleil ! <3") ;
        is_deux_sent = false ;
        return ;
      }
        id_deux_sent = false ;

      // Answer to ping
      if ( (new RegExp(`<@${Config.bot_id}>`, "ui")).test(message.content) )
      {
        if ( message.author.id === Config.owner_id )
        {
          message.channel.send("fdp ne me ping pas stp") ;
          message.channel.send("<:sea_pakontan:945802134803345459>") ;
        }
        else
        {
          message.channel.send("Je vous prie de bien vouloir arrêter de me \"ping\", comme disent les jeunes. :heart::call_me:") ;
        }

        return ;
      }

      if ( message.author.id === Config.nesta_id )
      {
        // Zeste délicieux.............
        if ( Math.random() < Config.proba_nesta )
        {
          message.channel.send(
              { 
                content : "",
                files : ["./files/nesta.gif"] 
              }
          ) ;
          return ;
        }
      }
      
      // Pee hehe 
      if ( Math.random() < Config.proba_pee )
      {
        message.channel.send(`*pees in ur ass* <@${message.author.id}>`) ;
        return ;
      }

      // Need to mimir
      {
        let date = message.createdAt ;
        if ( Math.random() < Config.proba_mimir && ( date.getHours() >= 2 && date.getHours() <= 5 ) )
        {
          message.channel.send(
            { 
              content : "",
              files : ["./files/es_hora_de_dormir.mp4"] 
            }
          ) ;
          return ;
        }
      }

      // Quoifeur, coubeh ; Commentdancousteau etc
      {
        if ( Math.random() < Config.proba_answer )
        {
          if ( word_to_regex("goyave", can_be_interogative = false).test(message.content) )
          {
            message.channel.send("Randomisa-hmmmmm.......") ;
            return ;
          }
          else if ( word_to_regex("quelconque", can_be_interogative = false).test(message.content)
          )
          {
            message.channel.send("Évêque.") ;
            return ;
          }
          else if ( word_to_regex("quoi").test(message.content) )
          {
            if ( Math.random() < 0.5 ) 
            {
              message.channel.send("-coubeh.") ;
            }
            else
            {
              message.channel.send("Feur.") ;
            }
            return ;
          }
          else if ( word_to_regex("pourquoi").test(message.content) )
          {
            if ( Math.random() < 0.5 ) 
            {
              message.channel.send("Pourcoubeh.") ;
            }
            else
            {
              message.channel.send("Pourfeur.") ;
            }
            return ;
          }
          else if ( word_to_regex("mais").test(message.content) )
          {
            message.channel.send("Juins.") ;
            return ;
          }
          else if ( word_to_regex("qui").test(message.content) )
          {
            message.channel.send("-rikou. <:sea_karaba:945801970386604042>") ;
            return ;
          }
          else if ( word_to_regex("comment").test(message.content) )
          {
            message.channel.send("-dant Cousteau.") ;
            return ;
          }
          else if ( word_to_regex("oui").test(message.content) )
          {
            message.channel.send("-stiti.") ;
            return ;
          }
          else if ( word_to_regex("non").test(message.content) )
          {
            message.channel.send("-bril.") ;
            return ;
          }
          else if ( word_to_regex("hein").test(message.content) )
          {
            message.channel.send("Deux.") ;
            is_deux_sent = true ;
            return ;
          }
          else if ( word_to_regex("merci").test(message.content) )
          {
            if ( Math.random() < 0.5 ) 
            {
              message.channel.send("-garette.") ;
            }
            else
            {
              message.channel.send("De rien.") ;
            }
            return ;
          }
          else if ( word_to_regex("ah").test(message.content) )
          {
            message.channel.send(":b:") ;
            return ;
          }
        }
      }

      // H
      {
        if ( word_to_regex("h", can_be_interogative = false).test(message.content) 
            && Math.random() < Config.proba_h )
        {
          let proba = Math.random() ;
          if ( proba < 0.25 )
          {
            message.channel.send(
              { 
                content : "",
                files : ["./files/h/h1.gif"] 
              }
            ) ;
          }
          else if ( proba >= 0.25 && proba < 0.5 )
          {
            message.channel.send(
              { 
                content : "",
                files : ["./files/h/h2.gif"] 
              }
            ) ;
          }
          else if ( proba >= 0.5 && proba < 0.75 )
          {
            message.channel.send(
              { 
                content : "",
                files : ["./files/h/h3.gif"] 
              }
            ) ;
          }
          else
          {
            message.channel.send(
              { 
                content : "",
                files : ["./files/h/h4.gif"] 
              }
            ) ;
          }
          return ;
        }
      }

      // Contexte?
      {
        if ( word_to_regex("contexte", start_end = false).test(message.content) 
            && Math.random() < Config.proba_contexte )
        {
          message.channel.send(
            { 
              content : "",
              files : ["./files/contexte.jpg"] 
            }
          ) ;
          return ;
        }
      }

      // Source?
      {
        if ( word_to_regex("source", start_end = false).test(message.content) 
            && Math.random() < Config.proba_source )
        {
          message.channel.send(
            { 
              content : "",
              files : ["./files/source.png"] 
            }
          ) ;
          return ;
        }
      }
    }
  }
) ;
