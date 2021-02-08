require('dotenv').config()
const config = {};
module.exports = config;

config.doc_formats = [       'application/octet-stream', 'application/json', 
'application/javascript',    'application/java',         'application/ecmascript',
'application/x-javascript']

config.msg = {
    start_msg : "This is simple [Pastebin Bot](pastebin.com) made by @dcdunkan from [Bots.DC](https://t.me/dcbots).\nWith this Bot, you can create pastes on pastebin super simply. Send /create to start creating the paste. \nHit /help for more details",
    start_msg_no_emb_msg : 'There was a error while getting the paste. Please make sure that the paste is Public or Unlisted.',
    cancelled_msg : "Paste Creation Cancelled. Enter /create to create a new paste. Or send /help to see the help message.",
    
    help_msg : "Here is a few things you can do with this bot. Click related numbered buttons to get more information about that. See about section to know more about the bot.\n*01*. Creating Pastes as a Guest.\n*02*. Logging in and paste.\n*03*. Configuring the optional arguments.\n*04*. Getting embed codes and links after pasting.",
    about_msg : "A few things *about this Pastebin Bot* if you want to know.\n• Developer : [Dunkan.DC](https://telegram.me/dcdunkan) from [Bots.DC](https://telegram.me/dcbots).\n• Language : [Node.JS](https://en.wikipedia.org/wiki/Node.js)\n• Telegram Bot API used : [Telegraf](https://telegraf.js.org)\n• Source Code : Open. https://github.com/dcdunkan/pastebin-bot\n• Bot version : 1.0.2\n\nJoin @dcbots for more. See the source code section to know more about the source code. Please star ⭐ if you like it. Do support by joining @dcbots. Thankyou for using thus service.",
    pastebin_what_msg : "*What is Pastebin?*" + 
    "\nSimply pastebin is a Text Cloud. This is an official description they gave as their website description:" + 
    "\n_Pastebin.com is the number one paste tool since 2002. Pastebin is a website where you can store text online for a set period of time_." + 
    "\n\nAnd this is what they given in their FAQ:\n*What is Pastebin.com all about?*" + 
    "\n_Pastebin is a website where you can store any text online for easy sharing. " + 
    "The website is mainly used by programmers to store pieces of sources code or configuration information, " + 
    "but anyone is more than welcome to paste any type of text. The idea behind the site is to make it more convenient for people to share large amounts of text online._",

    help_1_msg : "*Creating pastes as a guest.*\nInstructions\n• Hit /create and send some text to paste in the next message when the bot asks for.\n• Send a title for the paste when the bot asks.\n• From the prompted buttons, choose 'Paste as Guest' to continue.\n• Customize the optional arguments if you want to. Read more about them in the *03*rd section.\n• After customising, click the button ✅ Done.\n• Confirm the paste by clicking the paste as guest button.\n• Allow upto 10 seconds. Then the bot will give you the link for the paste. Read other sections for more.\n\nℹ️ The privacy option 'Private' is only available in Login mode.\n💡 Send /cancel in any process to stop the process.",
    help_2_msg : "*Logging in and paste.*\nInstructions\nℹ️ Pastebin account required! Create one if you haven't created yet.\n• Hit /create and send some text to paste in the next message when the bot asks for.\n• Send a title for the paste when the bot asks.\n• From the prompted buttons, choose 'Login and paste' to continue.\n• Customize the optional arguments if you want to. Read more about them in the *03*rd section.\n• After customising, click the button ✅ Done.\n• The bot will ask you for your username. Enter the username.\n• Bot will ask you for your password for the account. Don't worry. We won't be logging or saving your password.\n• After entering your password, bot will prompt you to confirm your paste. Click the Login and Paste button to paste.\n• Allow upto 10 seconds. Then the bot will give you the link for the paste. Read other sections for more.\n\nℹ️ The privacy option 'Private' is only available in *this* mode.\n💡 Send /cancel in any process to stop the process.",
    help_3_msg : "*Configuring the optional argu9ments.*\n• You can change the paste's optional arguments such as paste expiry, the syntax of your paste, paste exposure.\n• *Paste Expiry* : The expiry period of your paste. Defaults to NEVER. 10 Minutes to 1 Month available.\n• *Paste Syntax* : Send a valid syntax to highlight the paste. Defaults to TEXT. Checkout [this page](https://pastebin.com/doc_api#5) for available syntaxes.\n• *Paste Exposure* : The privacy of your paste. Defaults to PUBLIC. In guest mode, you can choose either public or unlisted (Anyone with the link mode). But in login mode, the PRIVATE mode will be available. Enjoy pasting! 😛",
    help_4_msg : "*Getting embed codes and links after pasting.*\n• After pasting, you will be able to get embed codes for your paste. This option only works properly if the paste is public or unlisted.\n• You can click the Embed Codes button, which will appear with the message after pasting successfully.\n• Then at bottom of your screen a START button will appear. Click it to get the message which contains the embed codes.",
    source_code_msg : "This is an OPEN SOURCE PROJECT. Source Code of this bot is available at github.com/dcdunkan/pastebin-bot. Please give us a ⭐ if you liked it. And if you got any ideas, requests, please make an issue, or pull a request. Thankyou."
}

config.msgopts = {
    start_msg_opts : { parse_mode: "Markdown", disable_web_page_preview: true, reply_markup : { inline_keyboard: [[{ text : 'Create a Paste', callback_data : 'create'}], [{ text : "Help", callback_data : "help" }, { text: "About", callback_data:'about' } ]]}},
    embed_msg_opts : { parse_mode: 'Markdown', reply_markup: { inline_keyboard : [[{ text : "Create a new Paste", callback_data : 'create'}]]}},

    help_msg_opts : { parse_mode : 'Markdown', disable_web_page_preview : true, reply_markup : { inline_keyboard : [ [ { text : '01', callback_data : '01' }, { text : '02', callback_data : '02' }, { text : '03', callback_data : '03' }, { text : '04', callback_data : '04' } ], [ { text : 'Home', callback_data : 'home' }, { text : 'About', callback_data : 'about' } ], [ { text : 'Create a Paste', callback_data : 'create' } ] ] } },
    about_msg_opts : { parse_mode : 'Markdown', disable_web_page_preview : true, reply_markup : { inline_keyboard : [ [ { text : 'Source Code', callback_data : 'source-code' } ], [ { text : 'What is Pastebin?', callback_data : 'pastebin-w' } ], [ { text : 'Home', callback_data : 'home' }, { text : 'Help', callback_data : 'help' } ], [ { text : 'Create a Paste', callback_data : 'create' } ] ] } },

    help_1_opts : { parse_mode : 'Markdown', reply_markup : { inline_keyboard : [ [ { text : '< 04', callback_data : '04' }, { text : '02 >', callback_data : '02' }, { text : 'Go back', callback_data : 'help' } ] ] } },
    help_2_opts : { parse_mode : 'Markdown', reply_markup : { inline_keyboard : [ [ { text : '< 01', callback_data : '01' }, { text : '03 >', callback_data : '03' }, { text : 'Go back', callback_data : 'help' } ] ] } },
    help_3_opts : { parse_mode : 'Markdown', disable_web_page_preview : false, reply_markup : { inline_keyboard : [ [ { text : '< 02', callback_data : '02' }, { text : '04 >', callback_data : '04' }, { text : 'Go back', callback_data : 'help' } ] ] } }, 
    help_4_opts : { parse_mode : 'Markdown', reply_markup : { inline_keyboard : [ [ { text : '< 03', callback_data : '03' }, { text : '01 >', callback_data : '01' }, { text : 'Go back', callback_data : 'help' } ] ] } },

    source_code_opts : { parse_mode : 'Markdown', reply_markup: { inline_keyboard : [[ { text: '< Go back', callback_data: 'about' } ]] } }
}

if(process.env.FIREBASE == 'true'){
    if(process.env.FB_APIKEY === undefined || process.env.FB_AUTHDOMAIN === undefined || process.env.FB_DATABASEURL === undefined || process.env.FB_PROJECTID === undefined || process.env.FB_STORAGEBUCKET === undefined || process.env.FB_MESSAGINGSENDERID === undefined || process.env.FB_APPID === undefined || process.env.FB_MEASUREMENTID === undefined){
        config.firebase = false
        console.log('Firebase is set to be enabled. But some of the or all of the required parameters are undefined in env. Make sure you set all of the parameters which required using the documentation https://github.com/dcdunkan/pastebin-bot/tree/v2/')
    } else {
        config.firebase = true
        console.log('Firebase is enabled');
        }
} else {
    config.firebase = false
}

config.firebaseConfig = {
    apiKey: process.env.FB_APIKEY,
    authDomain: process.env.FB_AUTHDOMAIN,
    databaseURL: process.env.FB_DATABASEURL,
    projectId: process.env.FB_PROJECTID,
    storageBucket: process.env.FB_STORAGEBUCKET,
    messagingSenderId: process.env.FB_MESSAGINGSENDERID,
    appId: process.env.FB_APPID,
    measurementId: process.env.FB_MEASUREMENTID
}
