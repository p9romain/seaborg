const { Client, GatewayIntentBits } = require("discord.js") ;
const Config = require("./config.json") ;
const Schedule = require("node-schedule") ;
const fs = require("fs");

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

function wouldAnswer(message, words, proba = Config.proba_answer)
{

  function regexifyWord(text)
  {
    let word = "" ;

    for ( const char of text )
    {
      word += char + '+' + fillers ;
    }

    return new RegExp("(^|\\s)" + word + "($|\\s\\??|\\?)", 
                "ui") ;
  }

  let res = false ;
  for (const word of words)
  {
    if ( regexifyWord(word).test(message) )
    {
      res = true ;
      break ;
    }
  }

  return res && Math.random() < proba ;
}

/*
    ============================================================================
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
    ============================================================================
*/

// Nous sommes vendredi
Schedule.scheduleJob(vendredi, () =>
  {
    let p1 = Math.random() ;
    let p2 = (p1 + 1)/2 ;

    let proba = Math.random() ;
    if ( proba < p1 )
    {
      general.send(
        { 
          content : "_Merci la Méluche._", 
          files : ["./files/vendredi/gauche.mp4"] 
        }
      ) ;
    }
    else if ( proba < p2 )
    {
      general.send(
        { 
          content : "_Merci Manu._", 
          files : ["./files/vendredi/droite.mp4"] 
        }
      ) ;
    }
    else
    {
      general.send(
        { 
          content : "_Merci Manu²._", 
          files : ["./files/vendredi/image.png"] 
        }
      ) ;
    }
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

        try 
        {
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
        catch {} // just a perm error so we ignore
      }
    }
    else if ( message.author.id !== Config.bot_id )
    {
      // Un, deux, trois, soleil !
      if ( is_deux_sent && 
           wouldAnswer(message.content, [ "trois" ], proba = 2))
      {
        message.channel.send("Soleil ! <3") ;
        is_deux_sent = false ;
        return ;
      }
      is_deux_sent = false ;

      // Answer to ping
      if ( (new RegExp(`(^|\\s)<@${Config.bot_id}>($|\\s\\??|\\?)`, "ui"))
             .test(message.content)
         )
      {
        let proba = Math.random() ;
        if ( proba < 0.2 )
        {
          message.channel.send("fdp ne me ping pas stp") ;
          message.channel.send("<:sea_pakontan:945802134803345459>") ;
        }
        else if ( proba < 0.4 )
        {
          message.channel.send("Je vous prie de bien vouloir arrêter de me \"ping\", comme disent les jeunes. :heart::call_me:") ;
        }
        else if ( proba < 0.6 )
        {
          message.channel.send("Qu'est-ce qui y a là, d'où tu me ping ?") ;
        }
        else if ( proba < 0.8 )
        {
          message.channel.send(`Pong <@${message.author.id}>`) ;
        }
        else
        {
          message.guild.members.fetch().then(members => 
            {
              message.channel.send(
                "Tu veux me ping ? Bah tiens cheh à " +
                members.random().user.toString()
              ) ;
            }
          );
        }

        return ;
      }

      // CURSE OF RA
      if ( Math.random() < Config.proba_curse )
      {
        for ( let i = 0 ; i < Math.floor( 100 * Math.random() ) ; i++ )
        {
          message.channel.send("CURSE OF RA 𓀀 𓀁 𓀂 𓀃 𓀄 𓀅 𓀆 𓀇 𓀈 𓀉 𓀊 𓀋 𓀌 𓀍 𓀎 𓀏 𓀐 𓀑 𓀒 𓀓 𓀔 𓀕 𓀖 𓀗 𓀘 𓀙 𓀚 𓀛 𓀜 𓀝 𓀞 𓀟 𓀠 𓀡 𓀢 𓀣 𓀤 𓀥 𓀦 𓀧 𓀨 𓀩 𓀪 𓀫 𓀬 𓀭 𓀲 𓀳 𓀴 𓀵 𓀶 𓀷 𓀸 𓀹 𓀺 𓀻 𓀼 𓀽 𓀾 𓀿 𓁀 𓁁 𓁂 𓁃 𓁄 𓁅 𓁆 𓁇 𓁈 𓁉 𓁊 𓁋 𓁍 𓁎 𓁏 𓁐 𓁑") ;
          for ( let j = 0 ; j < Math.floor( 100 * Math.random() ) ; j++ )
          {
            message.channel.send("** **") ;
          }
        }
        return ;
      }

      // Zeste délicieux.............
      if ( message.author.id === Config.nesta_id 
        && Math.random() < Config.proba_nesta )
      {
        message.channel.send(
            { 
              content : "",
              files : ["./files/nesta.gif"] 
            }
        ) ;
        return ;
      }
      
      // Pee hehe 
      if ( Math.random() < Config.proba_pee )
      {
        message.channel.send(`*pees in ur ass* <@${message.author.id}>`) ;
        return ;
      }

      // BTR MENTIONED????!!!??!?!?!!,,,,,,
      if ( wouldAnswer(message.content, 
             [ "btr", "bocchi", "ryo", "kita", 
               "nijika", "seika", "pa", "kikuri" ], 
             proba = Config.proba_btr)
          )
      {
        message.channel.send(
          "# :bangbang::bangbang: BTR MENTIONED :bangbang::bangbang:") ;
        fs.readdirSync("./files/btr/").forEach(file =>
          {
            message.channel.send(
              { 
                content : "",
                files : ["./files/btr/" + file] 
              }
            ) ;
          }
        ) ;

        return ;
      }

      // Need to mimir
      {
        let date = message.createdAt ;
        if ( Math.random() < Config.proba_mimir 
             && date.getHours() >= 2 && date.getHours() <= 5 )
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
        let [ text, channel ] = [ message.content, message.channel ] ;

        if ( wouldAnswer(text, [ "goyave" ]) )
        {
          channel.send("Randomisa-*hmmmmmmmmlmmmlmlmmmmlmlmlllllmllm*.......") ;
          return ;
        }
        else if ( wouldAnswer(text, [ "quelconque" ]) )
        {
          channel.send("Évêque.") ;
          return ;
        }
        else if ( wouldAnswer(text, 
                    [ "quoi", "kwa", "coua", "koa", "qoua", "koua", "qwa" ])
                )
        {
          if ( Math.random() < 0.5 ) 
          {
            channel.send("-coubeh.") ;
          }
          else
          {
            channel.send("Feur.") ;
          }
          return ;
        }
        else if ( wouldAnswer(text, 
                    [ "pourquoi", "pourkwa", "pourcoua", "pourkoa", 
                      "pourqoua", "pourkoua", "pourqwa", "pk", "pq" ]) 
                )
        {
          if ( Math.random() < 0.5 ) 
          {
            channel.send("Pourcoubeh.") ;
          }
          else
          {
            channel.send("Pourfeur.") ;
          }
          return ;
        }
        else if ( wouldAnswer(text, [ "mais", "mai", "mes", "mé", "meh" ]) )
        {
          channel.send("Juins.") ;
          return ;
        }
        else if ( wouldAnswer(text, [ "qui", "ki" ]) )
        {
          channel.send("-rikou. <:sea_karaba:945801970386604042>") ;
          return ;
        }
        else if ( wouldAnswer(text, [ "comment", "koman" ]) )
        {
          channel.send("-dant Cousteau.") ;
          return ;
        }
        else if ( wouldAnswer(text, 
                    [ "oui", "wii", "ui", "wee", 
                      "we", "woui", "vi", "vee" ]) 
                )
        {
          channel.send("-stiti.") ;
          return ;
        }
        else if ( wouldAnswer(text, [ "non" ]) )
        {
          channel.send("-bril.") ;
          return ;
        }
        else if ( wouldAnswer(text, [ "hein", "uh", "huh" ]) )
        {
          channel.send("Deux.") ;
          is_deux_sent = true ;
          return ;
        }
        else if ( wouldAnswer(text, [ "merci", "merchi", "merki" ]) )
        {
          if ( Math.random() < 0.5 ) 
          {
            channel.send("-garette.") ;
          }
          else
          {
            channel.send("De rien.") ;
          }
          return ;
        }
        else if ( wouldAnswer(text, [ "ah", "a" ]) )
        {
          channel.send(":b:") ;
          return ;
        }
      }

      // H
      if ( wouldAnswer(message.content, [ "h" ], proba = Config.proba_h) )
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
        else if ( proba < 0.5 )
        {
          message.channel.send(
            { 
              content : "",
              files : ["./files/h/h2.gif"] 
            }
          ) ;
        }
        else if ( proba < 0.75 )
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

      // Contexte?
      if ( wouldAnswer(message.content, [ "contexte" ], 
             proba = Config.proba_contexte)
         )
      {
        message.channel.send(
          { 
            content : "",
            files : ["./files/contexte.jpg"] 
          }
        ) ;
        return ;
      }

      // Source?
      if ( wouldAnswer(message.content, [ "source" ],
             proba = Config.proba_source)
         )
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
) ;
