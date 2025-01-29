const { Client, GatewayIntentBits } = require("discord.js") ;
const Config = require("./config.json") ;
const CronJob = require('cron').CronJob ;
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

function regexifyWord(text, anywhere)
{
  const fillers = 
    "(-|_|,|;|\\.|\\?|!|#|\\||=|\\+|°|%|\\$|£|\\*|'|\"|§|<|>|\\^)*" ;
  let word = "" ;

  for ( const char of text )
  {
    word += char + '+' + fillers ;
  }

  return new RegExp(`(^|\\s)${word}($|\\s${anywhere ? "" : "?\\?"})`, "ui") ;
}

function wouldAnswer(message, words, 
  proba = Config.proba_answer, anywhere = false)
{
  let res = false ;
  for ( const word of words )
  {
    if ( regexifyWord(word, anywhere).test(message) )
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

let general, cacapublier, pissoir, jap_channel, secret_channel ;
let old_channel, is_deux_sent ;

client.on("ready", () =>
  {
    general = client.channels.cache.get(Config.general_id) ;
    cacapublier = client.channels.cache.get(Config.cacapublier_id) ;
    pissoir = client.channels.cache.get(Config.pissoir_id) ;
    jap_channel = client.channels.cache.get(Config.jap_channel_id) ;
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
CronJob.from(
  {
    cronTime : "0 0 0 * * 5",
    onTick : () =>
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
                      message_attach = [ "./files/vendredi/gauche.mp4" ]) ;
        }
        else if ( proba < p2 )
        {
          sendMessage("Vendredi matin",
                      general,
                      "_Merci Manu._",
                      null,
                      message_attach = [ "./files/vendredi/droite.mp4" ]) ;
        }
        else
        {
          sendMessage("Vendredi matin",
                      general,
                      "_Merci Manu²._",
                      null,
                      message_attach = [ "./files/vendredi/image.png" ]) ;
        }
      },
    start : true,
    timeZone : "Europe/Paris"
  }
) ;

// It's Friday night !
CronJob.from(
  {
    cronTime : "0 0 20 * * 5",
    onTick : () =>
      {
        sendMessage("Vendredi soir",
          general, 
          "# <a:sea_fridaynight1:945779538519015424>"
            + "<a:sea_fridaynight2:945779540129611786> Time to dance !! "
            + "<a:sea_fridaynight1:945779538519015424>"
            + "<a:sea_fridaynight2:945779540129611786>",
          null,
          message_attach = [ "./files/friday_night.mp4" ]) ;
      },
    start : true,
    timeZone : "Europe/Paris"
  }
) ;

// EH OUI LE 7 DECEMBRE
CronJob.from(
  {
    cronTime : "0 0 * 7 12 *",
    onTick : () =>
      {
        if ( Math.random() < Config.proba_burger )
        {
          let proba = Math.random() ;
          if ( proba < 1/3 )
          {
            sendMessage("7 Décembre", 
              cacapublier,
              "# :hamburger: EH OUI :hamburger:",
              null,
              message_attach = [ "./files/eh_oui.mp4" ]) ;
          }
          else if ( proba < 2/3 )
          {
            sendMessage("7 Décembre",
              cacapublier,
              "# Eh oui :smiley:, le 7 décembre 2020 :scroll:, le hamburger :hamburger:, ma dire comme les jeunes :boy: calisse:wine_glass: de mineures :baby: mangeux de mardes :poop: de tabarnak :mosquito:  qui disent, le hamburger :hamburger: pédophile :japanese_ogre:, à Yaya, yyyyyaaaahouu :cowboy: les raies :fish: mangez donc toute d'la marde :poop: gang :people_wrestling: de calisse :wine_glass: ma toute vous calissez :wine_glass: à rivière :ocean: ma gang :people_wrestling: de tabarnak :mosquito: de mangeux d'marde :poop: de jeunes :boy: calisse :wine_glass: de tabarnak :mosquito:",
              null) ;
          }
          else
          {
            sendMessage("7 Décembre", 
              cacapublier,
              "# :hamburger: EH OUI :hamburger:",
              null,
              message_attach = [ "./files/eh_oui_le_retour.mp4" ]) ;
          }


        }
      },
    start : true,
    timeZone : "Europe/Paris"
  }
) ;

// The 21st night of September.........
CronJob.from(
  {
    cronTime : "0 0 0 22 9 *",
    onTick : () =>
      {
        sendMessage("21st night of September",
          general,
          "You remember, do you ? <a:sea_dog:945779538879737856>",
          null,
          message_attach = [ "./files/september_21.mp4" ]) ;
      },
    start : true,
    timeZone : "Europe/Paris"
  }
) ;

// SPOOKY MONTH ???????
CronJob.from(
  {
    cronTime : "0 0 0 1 10 *",
    onTick : () =>
      {
        sendMessage("SPOOKY MONTH !!!!!",
          general,
          "# <a:sea_spooky_dance_pumpkin:945779540372906024>"
            + "<a:sea_spooky_dance_skeleton:945779540138029117>"
            + "<a:sea_spooky_dance_pumpkin:945779540372906024>"
            + "<a:sea_spooky_dance_skeleton:945779540138029117>"
            + " I T   I S   D A   S P O O K Y   M O N T H :bangbang::bangbang: "
            + "<a:sea_spooky_dance_skeleton:945779540138029117>"
            + "<a:sea_spooky_dance_pumpkin:945779540372906024>"
            + "<a:sea_spooky_dance_skeleton:945779540138029117>"
            + "<a:sea_spooky_dance_pumpkin:945779540372906024>",
          null,
          message_attach = [ "./files/SPOOKY_MONTH.mp4" ]) ;
      },
    start : true,
    timeZone : "Europe/Paris"
  }
) ;

// Japanese words
function sendCommand() 
{
  let message ;
  if ( Math.random() < 0.5 )
  {
    message = "k!r n5" ;
  }
  else
  {
    message = "k!r n4" ;
  }

  sendMessage("Japanese words",
    jap_channel,
    message,
    null) ;
}

CronJob.from(
  {
    cronTime : "0 0 12 * * *",
    onTick : sendCommand,
    start : true,
    timeZone : "Europe/Paris"
  }
) ;
CronJob.from(
  {
    cronTime : "0 0 16 * * *",
    onTick : sendCommand,
    start : true,
    timeZone : "Europe/Paris"
  }
) ;
CronJob.from(
  {
    cronTime : "0 0 20 * * *",
    onTick : sendCommand,
    start : true,
    timeZone : "Europe/Paris"
  }
) ;

// Juillet
CronJob.from(
  {
    cronTime : "0 0 0 1 7 *",
    onTick : () =>
      {
        sendMessage("Juillet",
          general,
          "_Merci Monté._",
          null,
          message_attach = [ "./files/juillet.mp4" ]) ;
      },
    start : true,
    timeZone : "Europe/Paris"
  }
) ;

// Birthdays
client.on("ready", () =>
  {
    for ( const birthday of Config.birthdays )
    {
      CronJob.from(
        {
          cronTime : `0 30 9 ${birthday.date} *`,
          onTick : () =>
            {
              let users = "" ;
              let first_names = "" ;
              for ( const user of birthday.users )
              {
                users += "<@" + user.id + "> " ;
                first_names += user.comment + " " ;
              }

              debugInfo(general,
              	null,
                `Anniv(s) de : ${first_names}(${birthday.date})`, 
             	false,
              	verbose = DEBUG_MODE) ;

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
            },
          start : true,
          timeZone : "Europe/Paris"
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
      else
      if ( message_text === "@reset" )
      {
        console.log("====================================\n          Reset nicknames \n====================================") ;
        console.log() ;
        console.log() ;

        message.guild.members.fetch().then(members =>
          {
            for ( member of members )
            {
              if ( member[0] !== Config.owner_id )
              {
                member[1].setNickname("") ;
              }
            }
          }
        ) ;
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
          [ "jsuis", [] ],
          [ "jss", [] ], 
          [ "js", [] ], 
          [ "chui", [ "me" ] ], 
          [ "suis", ["tu", "jy", "jen", "me", "jte", "jme" ] ]
        ] ;

        for ( const [test, exceptions] of checks )
        {
          let skip = false ;
          for ( const except of exceptions )
          {
            if ( !skip )
            {
              const re = regexifyWord(except + " " + test, true) ;
              if ( re.test(message_text) )
              {
                skip = true ;  
              }
            }
          }
         
          if ( skip ) { return ; }

          const re = regexifyWord(test, true) ;
          if ( re.test(nickname) )
          {
            do_rename = true ;
            const split = nickname.split(re) ;
            if (split.findLastIndex(f => f) !== -1) 
            {
              nickname = split[split.findLastIndex(f => f)].trim() ;
            }
          }
        }

        if ( do_rename )
        {
          try
          {
            nickname = nickname.split(' ') ;
            let new_nickname = "" ;
            for ( const word of nickname )
            {
							let b = (new RegExp(/https?:\/\/\S+/g)).test(word) ; 	
              if ( !b && word.slice(0, 1) === "<" && word.slice(-1) === '>' )
              {
                break ;
              }
              else
              {
                new_nickname += word + " " ;
              }
            }
            new_nickname = new_nickname
							.slice(0, 32)
              .split( new RegExp("[.?!;\t\n\r\f\v]+", "ui") )[0] ;

            if ( new_nickname )
            {
              const tag = `Nicknaming from \"${message.member.displayName}\" ` 
                  + `to \"${new_nickname}\"` ;

              debugInfo(channel, 
                author, 
                tag,
                false,
                verbose = DEBUG_MODE) ;

               message.member.setNickname(new_nickname) ;
             }
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
        // CURSE OF RA
        {
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
              console.log() ;
            }
            return ;
          }
        }

        // Pee hehe 
        {
          if ( Math.random() < Config.proba_pee )
          {
            sendMessage("Pee", 
              channel, 
              `*pees in ur ass* <@${author.id}>`,
              author) ;
            return ;
          }
        }
        
        // Zeste délicieux.............
        {
          if ( author.id === Config.nesta_id 
                && Math.random() < Config.proba_nesta )
          {
            sendMessage("Nesta", 
              channel, 
              "", 
              author, 
              message_attach = [ "./files/nesta.gif" ]) ;
            return ;
          }
        }
        


        // Un, deux, trois, soleil !
        {
          if ( is_deux_sent
               && wouldAnswer(
                    message_text, 
                    [ "trois" ], 
                    proba = 2, 
                    anywhere = true) 
             )
          {
            sendMessage("Trois-Soleil", channel, "Soleil ! <3", author) ;
            is_deux_sent = false ;
            return ;
          }
          is_deux_sent = false ;
        }

        // Discord => scord
        {
          let re = new RegExp('di') ;
          if ( re.test(message) && Math.random() < Config.proba_di ) 
          {
						const without_link = message_text
							.split(' ')
							.reduce(
								(acc, s) => 
									{
										let re = new RegExp(/https?:\/\/\S+/g) ; 
										if ( re.test(s) )
										{
											return [] ;
										}
										else
										{
											acc.push(s) ;
											return acc ;
										}
									},
								[]
							)
							.join(' ') ;
						if ( re.test(without_link) )
						{
							const split = without_link.split(re) ;
							if (split.findLastIndex(f => f) !== -1) 
							{
								sendMessage("Di-blabla",
									channel,
									split[split.findLastIndex(f => f)].trim().slice(0, 32),
									author
								)
		
								return ;
							}
						}
          }
        }

        // BTR MENTIONED????!!!??!?!?!!,,,,,,
        {
          if ( wouldAnswer(message_text, 
                [ "btr", "bocchi", "ryo", "kita", 
                  "nijika", "seika", "pa", "kikuri" ], 
                proba = Config.proba_btr,
                anywhere = true)
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
              message_attach = [ "./files/es_hora_de_dormir.mp4" ]) ;
            return ;
          }
        }

        // Bref.
        {
          if ( wouldAnswer(message_text, 
                 [ "bref" ], 
                 proba = Config.proba_bref, 
                 anywhere = true)
             )
          {
            sendMessage("Bref", 
              channel, 
              "Bref.", 
              author, 
              message_attach = [ "./files/bref.gif" ]) ;
            return ;
          }
        }

        // Contexte?
        {
          if ( wouldAnswer(message_text, [ "contexte" ], 
                proba = Config.proba_contexte)
             )
          {
            sendMessage("Contexte",
              channel, 
              "",
              author,
              message_attach = [ "./files/contexte.jpg" ]) ;
            return ;
          }
        }

        // Source?
        {
          if ( wouldAnswer(message_text, [ "source" ],
                proba = Config.proba_source)
             )
          {
            sendMessage("Source",
              channel, 
              "",
              author,
              message_attach = [ "./files/source.png" ]) ;
            return ;
          }
        }

        // Quoifeur, coubeh ; Commentdancousteau etc
        {
          if ( wouldAnswer(
                 message_text, 
                 [ "goyave" ], 
                 proba = Config.proba_answer, 
                 anywhere = true) 
             )
          {
            sendMessage("Goyave", 
              channel, 
              "Randomisa-*hmmmmmmmmlmmmlmlmmmmlmlmlllllmllm*.......",
              author) ;
            return ;
          }
          else if ( wouldAnswer(
                 message_text, 
                 [ "quelconque" ], 
                 proba = Config.proba_answer, 
                 anywhere = true) 
             )
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
          else if ( wouldAnswer(
                 message_text, 
                 [ "merki", "thx", "thanks", 
                   "thank you", "ty", "cimer", "merchi" ], 
                 proba = Config.proba_answer, 
                 anywhere = true) 
             )
          {
            sendMessage("Merci-De rien+", channel, "De rien.", author) ;
            return ;
          }
          else if ( wouldAnswer(
                 message_text, 
                 [ "merci" ], 
                 proba = Config.proba_answer, 
                 anywhere = true) 
             )
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
          else if ( wouldAnswer(message_text, [ "re" ]) )
          {
            if ( Math.random() < 0.5 ) 
            {
              sendMessage("Renard", channel, "-nard.", author) ;
            }
            else
            {
              sendMessage("Requin", channel, "-quin.", author) ;
            }
            return ;
          }
        }

        // H
        {
          if ( wouldAnswer(
                message_text, 
                [ "h" ],
                proba = Config.proba_h, 
                anywhere = true) 
             )
          {
            const proba = Math.random() ;
            if ( proba < 0.25 )
            {
              sendMessage("H1",
                channel, 
                "",
                author,
                message_attach = [ "./files/h/h1.gif" ]) ;
            }
            else if ( proba < 0.5 )
            {
              sendMessage("H2",
                channel, 
                "",
                author,
                message_attach = [ "./files/h/h2.gif" ]) ;
            }
            else if ( proba < 0.75 )
            {
              sendMessage("H3",
                channel, 
                "",
                author,
                message_attach = [ "./files/h/h3.gif" ]) ;
            }
            else
            {
              sendMessage("H4",
                channel, 
                "",
                author,
                message_attach = [ "./files/h/h4.gif" ]) ;
            }
            return ;
          }
        }
      }
    }
  }
) ;