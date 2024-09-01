const { Client, GatewayIntentBits } = require("discord.js") ;
const Config = require("./config.json") ;
const Schedule = require("node-schedule") ;
const fs = require("fs") ;

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

const DEBUG_MODE = true ;

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

function debugInfo(channel, author, tag, error, verbose = false)
{
  console.log(`[${error ? "ERROR" : "DEBUG"}] ${tag}`) ;

  if ( verbose || error )
  {
    const now = new Date(Date.now()) ;
      
    console.log("------------------------------------\n"
        + "             DEBUG INFO \n------------------------------------") ;

    console.log(`In : ${channel.name}`) ;
    console.log(`At : ${getDate(now)}, ${getTime(now)}`) ;
    console.log(`Triggered by : ${author ? author.displayName : "No-one"}`) ;

    console.log("------------------------------------\n"
        + "             DEBUG INFO \n------------------------------------") ;
    console.log() ;
    console.log() ;
  }
}

function regexifyWord(text)
{
  const fillers = 
    "(-|_|,|;|\\.|\\?|!|#|\\||=|\\+|°|%|\\$|£|\\*|'|\"|§|<|>|\\^)*" ;
  let word = "" ;

  for ( const char of text )
  {
    word += char + '+' + fillers ;
  }

  return new RegExp("(^|\\s)" + word + "($|\\s\\??|\\?)", "ui") ;
}

function wouldAnswer(message, words, proba = Config.proba_answer)
{
  let res = false ;
  for ( const word of words )
  {
    if ( regexifyWord(word).test(message) )
    {
      res = true ;
      break ;
    }
  }

  return res && Math.random() < proba ;
}

function sendMessage(tag, channel, message_text, author, 
  message_attach = [], debug = true)
{    
  try
  {
    debugInfo(channel, author, tag, false, verbose = DEBUG_MODE && debug) ;

    channel.send(
      { 
        content : message_text,
        files : message_attach
      }
    ) ;
  }
  catch ( e )
  {
    debugInfo(channel, author, tag, true) ;
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
    const p1 = Math.random() ;
    const p2 = (p1 + 1)/2 ;

    const proba = Math.random() ;
    if ( proba < p1 )
    {
      sendMessage("Vendredi matin", 
        general,
        "_Merci la Méluche._",
        null,
        message_attach = ["./files/vendredi/gauche.mp4"]) ;
    }
    else if ( proba < p2 )
    {
      sendMessage("Vendredi matin",
        general,
        "_Merci Manu._",
        null,
        message_attach = ["./files/vendredi/droite.mp4"]) ;
    }
    else
    {
      sendMessage("Vendredi matin",
        general,
        "_Merci Manu²._",
        null,
        message_attach = ["./files/vendredi/image.png"]) ;
    }
  }
) ;

// It's Friday night !
Schedule.scheduleJob(friday_night, () =>
  {
    sendMessage("Vendredi soir",
      general, 
      "# <a:sea_fridaynight1:945779538519015424>"
        + "<a:sea_fridaynight2:945779540129611786> Time to dance !! "
        + "<a:sea_fridaynight1:945779538519015424>"
        + "<a:sea_fridaynight2:945779540129611786>",
      null,
      message_attach = ["./files/friday_night.mp4"]) ;
  }
) ;

// EH OUI LE 7 DECEMBRE
Schedule.scheduleJob("0 * 7 12 *", () =>
  {
    if ( Math.random() < Config.proba_burger )
    {
      sendMessage("7 Décembre", 
        cacapublier,
        "# :hamburger: EH OUI :hamburger:",
        null,
        message_attach = ["./files/eh_oui.mp4"]) ;
    }
  }
) ;

// Birthdays
client.on("ready", () =>
  {
    for ( const birthday of Config.birthdays )
    {
      Schedule.scheduleJob(("30 9 " + birthday.date + " *"), () => 
        {
          let users = "" ;
          let first_names = "" ;
          for ( const user of birthday.users )
          {
            users += "<@" + user.id + "> " ;
            first_names += user.comment + " " ;
          }

          console.log(`Anniv(s) de : ${first_names}(${birthday.date})`) ;

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
          const channel_id = msg[0].slice(2, -1) ; // channel id : <#channel_id>
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
            for ( const file of attachments )
            {
              files.push(file) ;
            }

            sendMessage("Talking bot (file.s, text)", 
              channel, 
              text, 
              null,
              message_attach = files,
              debug = false) ;
          }
          // without attachement
          else
          {
            sendMessage("Talking bot (text)", 
              channel,
              text, 
              null,
              message_attach = [],
              debug = false) ;
          }
        }
        // just attachements
        else if ( attachments.size )
        {
          let files = []
          for ( const file of attachments )
          {
            files.push(file) ;
          }

          sendMessage("Talking bot (file.s)", 
            channel, 
            "", 
            null, 
            message_attach = files,
            debug = false) ;
        }
      }
    }
    else if ( author.id !== Config.bot_id )
    {

      // Je suis....
      if ( author.id !== Config.owner_id )
      {
        let nickname = message_text ;
        let do_rename = false ;

        const checks = [ 
          [ "je suis", [] ], 
          [ "js", [] ] , 
          [ "jss", [] ], 
          [ "suis", ["tu", "jy", "jen", "me", "jte", "jme" ] ], 
          [ "chui", [ "me" ] ], 
          [ "jsuis", [] ] 
        ] ;

        for ( const [test, exceptions] of checks )
        {
          let skip = false ;
          for ( const except of exceptions )
          {
            if ( !skip )
            {
              const re = regexifyWord(except + " " + test) ;
              if ( re.test(message_text) )
              {
                skip = true ;  
              }
            }
          }
         
          if ( skip ) { return ; }

          const re = regexifyWord(test) ;
          if ( re.test(nickname) )
          {
            do_rename = true ;
            const split = nickname.split(re) ;
            nickname = split[split.findLastIndex(f => f)].trim() ;
          }
        }

        if ( do_rename )
        {
          try
          {
            const new_nickname = nickname.slice(0, 32) ; 
            const tag = `Nicknaming from \"${message.member.displayName}\" ` 
              + `to \"${new_nickname}\"` ;

            debugInfo(channel, 
              author, 
              tag,
              false,
              verbose = DEBUG_MODE) ;

            message.member.setNickname(new_nickname) ;
          }
          catch ( e ) 
          { 
            debugInfo(channel, author, "Nicknaming", true) ;
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
        const proba = Math.random() ;

        if ( proba < 0.2 )
        {
          sendMessage("Ping (pakontan)", 
            channel,
            "<:sea_pakontan:945802134803345459>", 
            author) ;
        }
        else if ( proba < 0.4 )
        {
          sendMessage("Ping (poli)", 
            channel,
            "Je vous prie de bien vouloir arrêter de me \"ping\", "
            + "comme disent les jeunes. :heart::call_me:", 
            author) ;
        }
        else if ( proba < 0.6 )
        {
          sendMessage("Ping (question)", 
            channel, 
            "Qu'est-ce qui y a là, d'où tu me ping ?", 
            author) ;
        }
        else if ( proba < 0.8 )
        {
          sendMessage("Ping (pong)", channel, `Pong <@${author.id}>`, author) ;
        }
        else
        {
          message.guild.members.fetch().then(members => 
            {
              const ping = "Tu veux me ping ? Bah tiens cheh à " 
                + members.random().user.toString() ;

              sendMessage("Ping (random)", channel, ping, author) ;
            }
          ) ;
        }

        return ;
      }

      if ( channel !== pissoir )
      {
        // Bref.
        if ( wouldAnswer(message_text, [ "bref" ], proba = Config.proba_bref) )
        {
          sendMessage("Bref", 
            channel, 
            "Bref.", 
            author, 
            message_attach = ["./files/bref.gif"]) ;
          return ;
        }

        // Un, deux, trois, soleil !
        if ( is_deux_sent && 
             wouldAnswer(message_text, [ "trois" ], proba = 2) )
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
            debugInfo(channel, 
              author, 
              "Curse of Ra", 
              false,
              verbose = DEBUG_MODE) ;

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
            debugInfo(channel, author, "Curse of Ra", true) ;
            console.log(e) ;
            console.log() ;
          }
          return ;
        }

        // Zeste délicieux.............
        if ( author.id === Config.nesta_id 
          && Math.random() < Config.proba_nesta )
        {
          sendMessage("Nesta", 
            channel, 
            "", 
            author, 
            message_attach = ["./files/nesta.gif"]) ;
          return ;
        }
        
        // Pee hehe 
        if ( Math.random() < Config.proba_pee )
        {
          sendMessage("Pee", 
            channel, 
            `*pees in ur ass* <@${author.id}>`,
            author) ;
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
          for ( const file of fs.readdirSync("./files/btr/") )
          {
            files.push("./files/btr/" + file) ;
          }

          sendMessage("BTR Mentioned", 
            channel, 
            "# :bangbang::bangbang: BTR MENTIONED :bangbang::bangbang:",
            author,
            message_attach = files) ;

          return ;
        }

        // Need to mimir
        {
          const hour = getTime(message.createdAt).split(':')[0] ;

          if ( Math.random() < Config.proba_mimir 
               && hour >= 2 && hour < 5 )
          {
            sendMessage("Mimir", 
              channel, 
              "", 
              author,
              message_attach = ["./files/es_hora_de_dormir.mp4"]) ;
            return ;
          }
        }

        // Quoifeur, coubeh ; Commentdancousteau etc
        {
          if ( wouldAnswer(message_text, [ "goyave" ]) )
          {
            sendMessage("Goyave", 
              channel, 
              "Randomisa-*hmmmmmmmmlmmmlmlmmmmlmlmlllllmllm*.......",
              author) ;
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
          else if ( wouldAnswer(message_text, 
                      [ "mais", "mai", "mes", "mé", "meh" ]) 
                  )
          {
            sendMessage("Mais-Juins", channel, "Juins.", author) ;
            return ;
          }
          else if ( wouldAnswer(message_text, [ "qui", "ki" ]) )
          {
            sendMessage("Kirikou", 
              channel, 
              "-rikou. <:sea_karaba:945801970386604042>",
              author) ;
            return ;
          }
          else if ( wouldAnswer(message_text, [ "comment", "koman" ]) )
          {
            sendMessage("Commandant Cousteau",
              channel, 
              "-dant Cousteau.",
              author) ;
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
          const proba = Math.random() ;
          if ( proba < 0.25 )
          {
            sendMessage("H1",
              channel, 
              "",
              author,
              message_attach = ["./files/h/h1.gif"]) ;
          }
          else if ( proba < 0.5 )
          {
            sendMessage("H2",
              channel, 
              "",
              author,
              message_attach = ["./files/h/h2.gif"]) ;
          }
          else if ( proba < 0.75 )
          {
            sendMessage("H3",
              channel, 
              "",
              author,
              message_attach = ["./files/h/h3.gif"]) ;
          }
          else
          {
            sendMessage("H4",
              channel, 
              "",
              author,
              message_attach = ["./files/h/h4.gif"]) ;
          }
          return ;
        }

        // Contexte?
        if ( wouldAnswer(message_text, [ "contexte" ], 
               proba = Config.proba_contexte)
           )
        {
          sendMessage("Contexte",
            channel, 
            "",
            author,
            message_attach = ["./files/contexte.jpg"]) ;
          return ;
        }

        // Source?
        if ( wouldAnswer(message_text, [ "source" ],
               proba = Config.proba_source)
           )
        {
          sendMessage("Source",
            channel, 
            "",
            author,
            message_attach = ["./files/source.png"]) ;
          return ;
        }
      }
    }
  }
) ;