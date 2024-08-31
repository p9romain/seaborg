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

const DEBUG_MODE = false ;

/*
    ============================================================================
*/

function getTime(date)
{
  return date.toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris" }) ;
}

function getDate(date)
{
  return date.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }) ;
}

function debugInfo(channel, author, tag, error = false, verbose = false)
{
  console.log(`[${error ? "ERROR" : "DEBUG"}] ${tag}`) ;

  if ( verbose || error )
  {
    let now = new Date(Date.now()) ;

    console.log("------------------------------------\n"
        + "             DEBUG INFO \n------------------------------------") ;

    console.log(`In : ${channel.name}`) ;
    console.log(`At : ${getDate(now)}, ${getTime(now)}`) ;
    console.log(`Triggered by : ${author ? author.displayName : "No-one"}`) ;

    console.log("------------------------------------\n"
        + "             DEBUG INFO \n------------------------------------") ;
  }
}

const fillers = 
  "(-|_|,|;|\\.|\\?|!|#|\\||=|\\+|°|%|\\$|£|\\*|'|\"|§|<|>|\\^)*" ;

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

function wouldAnswer(message, words, proba = Config.proba_answer)
{
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

function sendMessage(tag, channel, message_text, message_attach = [], debug = true, author = null)
{    
  try
  {
    debugInfo(channel, author, tag, verbose = DEBUG_MODE && debug) ;

    channel.send(
      { 
        content : message.content,
        files : message_attach
      }
    ) ;
  }
  catch ( e )
  {
    debugInfo(channel, author, tag, error = true) ;
    console.log(e) ;
    console.log() ;
    console.log() ;
  }
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

let general, cacapublier, pissoir, secret_channel ;
let old_channel, is_deux_sent ;

client.on("ready", () =>
  {
    general = client.channels.cache.get(Config.general_id) ;
    cacapublier = client.channels.cache.get(Config.cacapublier_id) ;
    pissoir = client.channels.cache.get(Config.pissoir_id) ;
    secret_channel = client.channels.cache.get(Config.secret_channel_id) ;

    old_channel = general ;
    is_deux_sent = false ;

    console.log() ;
    console.log() ;
    console.log("====================================\n"
      + "               Ready \n====================================") ;
    console.log() ;
    console.log() ;
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
      sendMessage("Vendredi matin", general,
        "_Merci la Méluche._", 
        message_attach = ["./files/vendredi/gauche.mp4"]) ;
    }
    else if ( proba < p2 )
    {
      sendMessage("Vendredi matin", general,
        "_Merci Manu._", 
        message_attach = ["./files/vendredi/droite.mp4"]) ;
    }
    else
    {
      sendMessage("Vendredi matin", general,
        "_Merci Manu²._", 
        message_attach = ["./files/vendredi/image.png"]) ;
    }
  }
) ;

// It's Friday night !
Schedule.scheduleJob(friday_night, () =>
  {
    sendMessage("Vendredi soir", general, 
      "# <a:sea_fridaynight1:945779538519015424>"
        + "<a:sea_fridaynight2:945779540129611786> Time to dance !! "
        + "<a:sea_fridaynight1:945779538519015424>"
        + "<a:sea_fridaynight2:945779540129611786>",
      message_attach = ["./files/friday_night.mp4"]) ;
  }
) ;

// EH OUI LE 7 DECEMBRE
Schedule.scheduleJob("0 * 7 12 *", () =>
  {
    if ( Math.random() < Config.proba_burger )
    {
      sendMessage("7 Décembre", cacapublier,
        "# :hamburger: EH OUI :hamburger:",
        message_attach = ["./files/eh_oui.mp4"]) ;
    }
  }
) ;

// Birthdays
client.on("ready", () =>
  {
    Config.birthdays.forEach(birthday =>
      {
        Schedule.scheduleJob(("30 9 " + birthday.date + " *"), () => 
          {
            let users = "" ;
            let first_names = "" ;
            birthday.users.forEach(user =>
              {
                users += "<@" + user.id + "> " ;
                first_names += user.comment + " " ;
              }
            ) ;

            console.log(`Anniv(s) de : ${first_names}(${birthday.date})`);

            general.send(":index_pointing_at_the_viewer:"
              + ":index_pointing_at_the_viewer:"
              + ":index_pointing_at_the_viewer:") ;
            general.send(users) ; 
            general.send("** **") ;
            general.send(":palm_up_hand::birthday:") ; 
            general.send("** **") ;
            general.send("** **") ;
            general.send(
              `:clap::clap: <@&${Config.birthday_role}> :clap::clap:`) ;
          }
        ) ;
      }
    ) ;
  }
) ;


client.on("messageCreate", message =>
  {
    const channel = message.channel ;
    const author = message.author ;
    const message_text = message.content ;

    if ( channel === secret_channel )
    {
      if ( message_text === "@stop" )
      {
        console.log() ;
        console.log() ;
        console.log("====================================\n                Stop \n====================================") ;
        console.log() ;
        console.log() ;
        process.exit(0) ; 
      }

      // TALK MY CHILD !!!!
      else
      {
        const msg = message_text.split(' ') ; // whole message
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
            attachments.forEach(file =>
              {
                files.push(file) ;
              }
            ) ;
            sendMessage("Talking bot (file.s, text)", channel, text, 
              message_attach = files,
              debug = false) ;
          }
          // without attachement
          else
          {
            sendMessage("Talking bot (text)", channel, text,
                        debug = false) ;
          }
        }
        // just attachements
        else if ( attachments.size )
        {
          let files = []
          attachments.forEach(file =>
            {
              files.push(file) ;
            }
          ) ;
          sendMessage("Talking bot (file.s)", channel, "", 
              message_attach = files,
              debug = false) ;
        }
      }
    }
    else if ( author.id !== Config.bot_id )
    {

      // Je suis....
      {
        let nickname = message_text ;
        let do_rename = false ;

        [ "je suis", "js", "suis", "chui", "jsuis" ]
          .forEach(word =>
            {
              let re = regexifyWord(word) ;
              if ( re.test(nickname) )
              {
                do_rename = true ;
                let split = nickname.split(re) ;
                nickname = split[split.findLastIndex(f => f)].trim() ;
              }
            }
          )

        if ( do_rename )
        {
          try
          {
            let new_nickname = nickname.slice(0, 32) ; 

            debugInfo(channel, author, 
              `Nicknaming to ${new_nickname}`, 
              verbose = DEBUG_MODE) ;

            message.member.setNickname(new_nickname) ;
          }
          catch ( e ) 
          { 
            debugInfo(channel, author, "Nicknaming", 
              error = true) ;
            console.log(e) ;
            console.log() ;
            console.log() ;
          }

          return ;
        }
      }

      // Answer to ping
      if ( (new RegExp(`<@${Config.bot_id}>`, "ui")).test(message_text) )
      {
        let proba = Math.random() ;

        if ( proba < 0.2 )
        {
          sendMessage("Ping (pakontan)", channel,
            "<:sea_pakontan:945802134803345459>", author) ;
        }
        else if ( proba < 0.4 )
        {
          sendMessage("Ping (poli)", channel,
            "Je vous prie de bien vouloir arrêter de me \"ping\", "
            + "comme disent les jeunes. :heart::call_me:", author) ;
        }
        else if ( proba < 0.6 )
        {
          sendMessage("Ping (question)", channel, 
            "Qu'est-ce qui y a là, d'où tu me ping ?", author) ;
        }
        else if ( proba < 0.8 )
        {
          sendMessage("Ping (pong)", channel, `Pong <@${author.id}>`, author) ;
        }
        else
        {
          message.guild.members.fetch().then(members => 
            {
              let ping = "Tu veux me ping ? Bah tiens cheh à " 
                + members.random().user.toString() ;
              sendMessage("Ping (random)", channel, ping, author) ;
            }
          );
        }

        return ;
      }

      if ( channel !== pissoir )
      {
        // Bref.
        if ( wouldAnswer(message_text, [ "bref" ], proba = Config.proba_bref) )
        {
          sendMessage("Bref", channel, "Bref.", 
            message_attach = ["./files/bref.gif"] , author) ;
          return ;
        }

        // Un, deux, trois, soleil !
        if ( is_deux_sent && 
             wouldAnswer(message_text, [ "trois" ], proba = 2))
        {
          sendMessage("Trois-Soleil", channel, "Soleil ! <3", author) ;
          is_deux_sent = false ;
          return ;
        }
        is_deux_sent = false ;

        // CURSE OF RA
        if ( Math.random() < Config.proba_curse )
        {
          try
          {
            console.log("[DEBUG] Curse of Ra") ;
            for ( let i = 0 ; i < Math.floor( 100 * Math.random() ) ; i++ )
            {
              channel.send("CURSE OF RA 𓀀 𓀁 𓀂 𓀃 𓀄 𓀅 𓀆 𓀇 𓀈 𓀉 𓀊 𓀋 𓀌 𓀍 𓀎 𓀏 𓀐 𓀑 𓀒 𓀓 𓀔 𓀕 𓀖 𓀗 𓀘 𓀙 𓀚 𓀛 𓀜 𓀝 𓀞 𓀟 𓀠 𓀡 𓀢 𓀣 𓀤 𓀥 𓀦 𓀧 𓀨 𓀩 𓀪 𓀫 𓀬 𓀭 𓀲 𓀳 𓀴 𓀵 𓀶 𓀷 𓀸 𓀹 𓀺 𓀻 𓀼 𓀽 𓀾 𓀿 𓁀 𓁁 𓁂 𓁃 𓁄 𓁅 𓁆 𓁇 𓁈 𓁉 𓁊 𓁋 𓁍 𓁎 𓁏 𓁐 𓁑") ;
              for ( let j = 0 ; j < Math.floor( 100 * Math.random() ) ; j++ )
              {
                channel.send("** **") ;
              }
            }
          }
          catch ( e )
          {
            console.log("[ERROR] Curse of Ra :") ;
            console.log(e) ;
            console.log() ;
          }
          return ;
        }

        // Zeste délicieux.............
        if ( author.id === Config.nesta_id 
          && Math.random() < Config.proba_nesta )
        {
          sendMessage("Nesta", channel, "", 
            message_attach = ["./files/nesta.gif"], author) ;
          return ;
        }
        
        // Pee hehe 
        if ( Math.random() < Config.proba_pee )
        {
          sendMessage("Pee", channel, 
            `*pees in ur ass* <@${author.id}>`, author) ;
          return ;
        }

        // BTR MENTIONED????!!!??!?!?!!,,,,,,
        if ( wouldAnswer(message_text, 
               [ "btr", "bocchi", "ryo", "kita", 
                 "nijika", "seika", "pa", "kikuri" ], 
               proba = Config.proba_btr)
            )
        {
          let files = []
          fs.readdirSync("./files/btr/")
            .forEach(file =>
              {
                files.push("./files/btr/" + file) ;
              }
            ) ;

          sendMessage("BTR Mentioned", channel, 
            "# :bangbang::bangbang: BTR MENTIONED :bangbang::bangbang:", 
            message_attach = files, author) ;

          return ;
        }

        // Need to mimir
        {
          let hour = getTime(message.createdAt.split(':')[0]) ;

          if ( Math.random() < Config.proba_mimir 
               && hour >= 2 && hour < 5 )
          {
            sendMessage("Mimir", channel, "", 
              message_attach = ["./files/es_hora_de_dormir.mp4"], author) ;
            return ;
          }
        }

        // Quoifeur, coubeh ; Commentdancousteau etc
        {
          if ( wouldAnswer(message_text, [ "goyave" ]) )
          {
            sendMessage("Goyave", channel, 
              "Randomisa-*hmmmmmmmmlmmmlmlmmmmlmlmlllllmllm*.......", author) ;
            return ;
          }
          else if ( wouldAnswer(message_text, [ "quelconque" ]) )
          {
            sendMessage("Évêque quelconque", channel, "Évêque.", author) ;
            return ;
          }
          else if ( wouldAnswer(message_text, 
                      [ "quoi", "kwa", "coua", "koa", "qoua", "koua", "qwa" ])
                  )
          {
            if ( Math.random() < 0.5 ) 
            {
              sendMessage("Quoicoubeh", channel, "-coubeh.", author) ;
            }
            else
            {
              sendMessage("Quoi-feur", channel, "Feur.", author) ;
            }
            return ;
          }
          else if ( wouldAnswer(message_text, 
                      [ "pourquoi", "pourkwa", "pourcoua", "pourkoa", 
                        "pourqoua", "pourkoua", "pourqwa", "pk", "pq" ]) 
                  )
          {
            if ( Math.random() < 0.5 ) 
            {
              sendMessage("Pourquoicoubeh", channel, "Pourcoubeh.", author) ;
            }
            else
            {
              sendMessage("Pourquoi-feur", channel, "Pourfeur.", author) ;
            }
            return ;
          }
          else if ( wouldAnswer(message_text, [ "mais", "mai", "mes", "mé", "meh" ]) )
          {
            sendMessage("Mais-Juins", channel, "Juins.", author) ;
            return ;
          }
          else if ( wouldAnswer(message_text, [ "qui", "ki" ]) )
          {
            sendMessage("Kirikou", channel, 
              "-rikou. <:sea_karaba:945801970386604042>", author) ;
            return ;
          }
          else if ( wouldAnswer(message_text, [ "comment", "koman" ]) )
          {
            sendMessage("Commandant Cousteau", channel, "-dant Cousteau.", author) ;
            return ;
          }
          else if ( wouldAnswer(message_text, 
                      [ "oui", "wii", "ui", "wee", 
                        "we", "woui", "vi", "vee" ]) 
                  )
          {
            sendMessage("Oustiti", channel, "-stiti.", author) ;
            return ;
          }
          else if ( wouldAnswer(message_text, [ "non" ]) )
          {
            sendMessage("Nombril", channel, "-bril.", author) ;
            return ;
          }
          else if ( wouldAnswer(message_text, [ "hein", "uh", "huh" ]) )
          {
            sendMessage("Un-deux", channel, "Deux.", author) ;
            is_deux_sent = true ;
            return ;
          }
          else if ( wouldAnswer(message_text, [ "merci", "merchi", "merki" ]) )
          {
            if ( Math.random() < 0.5 ) 
            {
              sendMessage("Mercigarette", channel, "-garette.", author) ;
            }
            else
            {
              sendMessage("Merci-De rien", channel, "De rien.", author) ;
            }
            return ;
          }
          else if ( wouldAnswer(message_text, [ "ah" ]) )
          {
            sendMessage("A-B", channel, ":b:", author) ;
            return ;
          }
        }

        // H
        if ( wouldAnswer(message_text, [ "h" ], proba = Config.proba_h) )
        {
          let proba = Math.random() ;
          if ( proba < 0.25 )
          {
            sendMessage("H1", channel, "", 
              message_attach = ["./files/h/h1.gif"], author) ;
          }
          else if ( proba < 0.5 )
          {
            sendMessage("H2", channel, "", 
              message_attach = ["./files/h/h2.gif"], author) ;
          }
          else if ( proba < 0.75 )
          {
            sendMessage("H3", channel, "", 
              message_attach = ["./files/h/h3.gif"], author) ;
          }
          else
          {
            sendMessage("H4", channel, "", 
              message_attach = ["./files/h/h4.gif"], author) ;
          }
          return ;
        }

        // Contexte?
        if ( wouldAnswer(message_text, [ "contexte" ], 
               proba = Config.proba_contexte)
           )
        {
          sendMessage("Contexte", channel, "", 
            message_attach = ["./files/contexte.jpg"], author) ;
          return ;
        }

        // Source?
        if ( wouldAnswer(message_text, [ "source" ],
               proba = Config.proba_source)
           )
        {
          sendMessage("Source", channel, "", 
            message_attach = ["./files/source.png"], author) ;
          return ;
        }
      }
    }
  }
) ;