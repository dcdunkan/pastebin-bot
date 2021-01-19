const config = require("./config");
require('dotenv').config()

const paste = require("better-pastebin");
paste.setDevKey(process.env.PASTE_DEVKEY);

const { Telegraf } = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const { leave } = Stage;
const bot = new Telegraf(process.env.BOT_TOKEN);


// Create scene manager
const stage = new Stage();
stage.command('cancel', leave());

// Scene registration
const getPaste = new Scene('getPaste');
stage.register(getPaste);
const getName = new Scene('getName');
stage.register(getName);

// paste methods
const method = new Scene('method');
stage.register(method);

const guest = new Scene('guest');
stage.register(guest);
const login = new Scene('login');
stage.register(login);
const loginPaste = new Scene('loginPaste');
stage.register(loginPaste);

const getSyntax = new Scene('getSyntax');
stage.register(getSyntax);
const getPrivacy = new Scene('getPrivacy');
stage.register(getPrivacy);
const getExpiry = new Scene('getExpiry');
stage.register(getExpiry);

const getUsername = new Scene('getUsername');
stage.register(getUsername);
const getPass = new Scene('getPass');
stage.register(getPass);

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
    const match = ctx.message.text.split(' ')[1];
    if(match === undefined){
        ctx.reply(config.messages.START_MESSAGE, { parse_mode : "Markdown", disable_web_page_preview: true, reply_markup : config.messages.START_MESSAGE_KEYBOARD })
    } else {
        const paste_id = match.split('_')[1];
        // < src="https://pastebin.com/embed_js/${paste_id}"></>
        paste.get(paste_id, function(success, data) {
            const blah = "<";
            const embed_message =
            `*Embed Codes For Paste ID: ${paste_id}*` + "\nIn order to embed this content into your website or blog, simply copy and paste one of the codes provided below.\n*1. JavaScript Embedding*\nShows full code, full height depending on amount of lines in paste:\n`" +
            `${blah}script src="https://pastebin.com/embed_js/${paste_id}"></scipt>` + "`" +
            `\nEnable *dark theme*:\n` + "`" + `${blah}script src="https://pastebin.com/embed_js/${paste_id}?theme=dark"></script>`
            + "`" + `\n\n*2. Iframe Embedding*\nYou can set the frame height by adding the CSS value '` + "`" + `height:100px;` +
            "`" + `' for example:\n` + "`" +
            `${blah}iframe src="https://pastebin.com/embed_iframe/${paste_id}" style="border:none;width:100%"></iframe>` + "`" +
            `\nEnable dark theme:\n` + "`" + `${blah}iframe src="https://pastebin.com/embed_iframe/${paste_id}?theme=dark" style="border:none;width:100%"></iframe>` + "`";

            if(success){
                ctx.reply(embed_message, { parse_mode: 'Markdown', reply_markup: { inline_keyboard : [[{ text : "Create a new Paste", callback_data : 'create'}]]}})
            } else {
                ctx.reply('There was a error while getting the paste. Please make sure that the paste is Public or Unlisted.')
            }
        });
    }
})
bot.action('create', async (ctx) => {
    await ctx.reply("Good! Now enter the *paste*(I mean text) you want to paste.", { parse_mode : "Markdown"});
    ctx.scene.enter('getPaste');
})

getPaste.command('cancel', (ctx) => ctx.reply(config.messages.PASTE_CREATION_CANCELLED_MESSAGE))
getUsername.enter((ctx) => ctx.reply('*Send a valid username* that already registered on pastebin.com. If the username you giving is invalid, the paste creation will get stopped.\nHit /cancel to cancel this process.', { parse_mode : "Markdown", disable_web_page_preview: true }))
getPass.enter((ctx) => ctx.reply('*Send the password* for the account now.\nDonot worry about security. We are not storing your password or username, even the paste. Also, you will be able to monitor any security issues through your mail.\nHit /cancel to cancel this process.', { parse_mode : "Markdown", disable_web_page_preview: true }))

getPaste.command('cancel', (ctx) => ctx.reply(config.messages.PASTE_CREATION_CANCELLED_MESSAGE))
getUsername.command('cancel', (ctx) => ctx.reply(config.messages.PASTE_CREATION_CANCELLED_MESSAGE))
getPass.command('cancel', (ctx) => ctx.reply(config.messages.PASTE_CREATION_CANCELLED_MESSAGE))
method.command('cancel', (ctx) => ctx.reply(config.messages.PASTE_CREATION_CANCELLED_MESSAGE, { parse_mode : "Markdown" , remove_keyboard: true }))

// Bot commands
bot.command('create', async (ctx) => {
    await ctx.reply("Good! Now enter the *paste*(I mean text) you want to paste.", { parse_mode : "Markdown"});
    ctx.scene.enter('getPaste')
})

getPaste.enter((ctx) => ctx.reply('*Send the paste* in the next message. Only upto 4096 characters avaialable for now. This will be fixed in the next Update.\nHit /cancel to cancel this process.', { parse_mode : "Markdown", disable_web_page_preview: true }))

getPaste.on('text', async (ctx) => {
    await ctx.reply('Paste saved.')
    ctx.session.paste = ctx.message.text;
    ctx.scene.leave('getPaste')
    ctx.scene.enter('getName')
});

getName.enter((ctx) => ctx.reply('*Send the Title for your Paste* in the next message.\nHit /cancel to cancel this process.', { parse_mode : "Markdown", disable_web_page_preview: true }))
getName.on('text', async (ctx) => {
    await ctx.reply('Title saved.')
    ctx.scene.leave('getName')
    ctx.scene.enter('method')

    ctx.session.name = ctx.message.text;
    ctx.session.format = 'text';
    ctx.session.privacy = 'Public';
    ctx.session.privacyno = 0;
    ctx.session.expires = 'Never';
    ctx.session.expirescode = 'N';
})

// METHOD
method.enter((ctx) => ctx.reply('Choose a method to paste. Either login, or paste as guest. [Read the /help to know more about the login features]', { parse_mode : "Markdown", disable_web_page_preview: true, reply_markup : { keyboard: [['Paste as Guest'], ['Login and Paste']] , one_time_keyboard: true, resize_keyboard: true, remove_keyboard : true}}))
method.hears('Paste as Guest', (ctx) => {
    ctx.session.isGuest = true;
    ctx.scene.leave('method')
    ctx.scene.enter('guest')
})
method.hears('Login and Paste', (ctx) => {
    ctx.session.isGuest = false;
    ctx.scene.leave('method')
    ctx.scene.enter('login')
})


guest.enter((ctx) => {
    ctx.reply(`So, you are ready to *paste as a guest*. Change the options if you want to.\nCurrent Status\nName : ${ctx.session.name}\nSyntax : ${ctx.session.format}\nPrivacy : ${ctx.session.privacy}\nExpires : ${ctx.session.expires}\n`,
        {   parse_mode : 'Markdown',
            remove_keyboard : true,
            reply_markup : { 
                remove_keyboard: true, 
                inline_keyboard : [
                    [{ text: `Syntax : ${ctx.session.format}`, callback_data: 'format' }],
                    [{ text: `Privacy : ${ctx.session.privacy}`, callback_data: 'privacy' }],
                    [{ text: `Expires : ${ctx.session.expires}`, callback_data: 'expiry' }],
                    [{ text: '✔️ Done', callback_data: 'done-opts' }]
                ]
            }
        });
})
login.enter((ctx) => {
    ctx.reply(`So, you are ready to *login and paste*. Change the options if you want to.\nCurrent Status\nName : ${ctx.session.name}\nSyntax : ${ctx.session.format}\nPrivacy : ${ctx.session.privacy}\nExpires : ${ctx.session.expires}\n`,
        {   parse_mode : 'Markdown',
            remove_keyboard : true,
            reply_markup : { 
                remove_keyboard: true, 
                inline_keyboard : [
                    [{ text: `Syntax : ${ctx.session.format}`, callback_data: 'format' }],
                    [{ text: `Privacy : ${ctx.session.privacy}`, callback_data: 'privacy' }],
                    [{ text: `Expires : ${ctx.session.expires}`, callback_data: 'expiry' }],
                    [{ text: '✔️ Done', callback_data: 'done-opts' }]
                ]
            }
        }
    );
})
guest.action('format', (ctx) => {
    const msg = ctx.update.callback_query.message;
    ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id, `Send a new syntax formatting to continue.\nCurrent Syntax is setted to : *${ctx.session.privacy}*\n\nIf you don't know which are these available syntaxes, check this [page](https://pastebin.com/doc_api#5) and enter a valid one. Or it will get an error`, { parse_mode : 'Markdown', disable_web_page_preview : true })
    ctx.scene.enter('getSyntax')
})
login.action('format', (ctx) => {
    const msg = ctx.update.callback_query.message;
    ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id, `Send a new syntax formatting to continue.\nCurrent Syntax is setted to : *${ctx.session.privacy}*\n\nIf you don't know which are these available syntaxes, check this [page](https://pastebin.com/doc_api#5) and enter a valid one. Or it will get an error`, { parse_mode : 'Markdown', disable_web_page_preview : true })
    ctx.scene.enter('getSyntax')
})
guest.action('privacy', async (ctx) => {
    await ctx.deleteMessage();
    ctx.scene.enter('getPrivacy')
})
login.action('privacy', async (ctx) => {
    await ctx.deleteMessage();
    ctx.scene.enter('getPrivacy')
})
guest.action('expiry', async (ctx) => {
    await ctx.deleteMessage();
    ctx.scene.enter('getExpiry')
})
login.action('expiry', async (ctx) => {
    await ctx.deleteMessage();
    ctx.scene.enter('getExpiry')
})
guest.action('done-opts', async (ctx) => {
    await ctx.deleteMessage();
    ctx.reply('So, you are ready to paste as a guest. Click the button below to confirm the paste.', { parse_mode : "Markdown", reply_markup : { remove_keyboard: true, inline_keyboard : [[{ text: 'Paste as Guest', callback_data: 'paste-guest' }]] }});
})
login.action('done-opts', async (ctx) => {
    await ctx.deleteMessage();
    ctx.reply("So, you are ready to login and paste. Send your *USERNAME* of Pastebin. If you haven't created a account yet, please create one from [here](https://pastebin.com/signup)", { parse_mode : 'Markdown' });
    ctx.scene.leave('login');
    ctx.scene.enter('getUsername')
})

getUsername.on('text', async (ctx) => {
    ctx.session.username = ctx.message.text;
    await ctx.deleteMessage();
    await ctx.reply('Username saved in session storage.')
    ctx.scene.leave('getUsername');
    ctx.scene.enter('getPass')
})

getPass.enter((ctx) => ctx.reply("Please enter your password. Don't worry, we won't be saving your password in our session storage. We are not storing them local or cloud."))
getPass.on('text', async (ctx) => {
    ctx.session.pass = ctx.message.text;
    await ctx.deleteMessage();
    await ctx.reply('Password saved in session storage.')
    ctx.scene.leave('getPass');
    ctx.scene.enter('loginPaste')
})

loginPaste.enter((ctx) => ctx.reply("Click the button to confirm your paste by logging in. It may take upto 10 seconds. Please be patient. Thankyou for using our service. ", { reply_markup : {inline_keyboard : [[{ text : "Login and Paste", callback_data :'login-paste' }]] }}))
loginPaste.action('login-paste', async (ctx) => {
    await paste.login(ctx.session.username, ctx.session.pass, function(success, data) {
        if(!success) {
            ctx.reply('Some error occurred while logging in. Please try again later. Make sure that the username and password is correct.')
            return false;
        } else {
            const msg = ctx.update.callback_query.message;
            paste.create({
                contents: ctx.session.paste,
                name: ctx.session.name,
                expires : ctx.session.expirescode,
                format : ctx.session.format,
                privacy : ctx.session.privacyno
            }, function(success, data) {
                if(success) {
                    const raw = "https://pastebin.com/raw/" + data.split('/')[3];
                    ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                        `The Paste [${ctx.session.name}](${data}) has been Successfully Pasted at ${data}`, { parse_mode : "Markdown", reply_markup: { inline_keyboard : [[{text : "See on browser", url : data }], [{text : "RAW Data", url : raw }, { text : 'Embed Codes', url : `http://t.me/dctesterbot?start=emb_${data.split('/')[3]}` }]]}
                    });
                } else {
                    ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                        `Some kind of error occurred. Error Data : ${data}`, { parse_mode : "Markdown" }
                    );
                }
            });
            ctx.scene.leave('loginPaste')

        }
    });
    
})

getSyntax.on('text', async (ctx) => {
    ctx.session.format = ctx.message.text;
    await ctx.reply('Format applied successfully.')
    ctx.scene.leave('getSyntax');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})

getPrivacy.enter((ctx) => {
    var getPrivacKeyboard = [];
    if(ctx.session.isGuest == true){
        getPrivacKeyboard = [
            [{text : '📢 Public',callback_data : 'public'}],
            [{text : '👁️ Unlisted',callback_data : 'unlisted'}],
            [{text : '❌ cancel',callback_data : 'cancel'}]
        ]
    } else {
        getPrivacKeyboard = [
            [{text : '📢 Public',callback_data : 'public'}],
            [{text : '👁️ Unlisted',callback_data : 'unlisted'}],
            [{text : '🔐 Private',callback_data : 'private'}],
            [{text : '❌ cancel',callback_data : 'cancel'}]
        ]
    }
    ctx.reply(`Choose a Privacy mode from below.\nCurrent Privacy Status is ${ctx.session.privacy}`,
        {   parse_mode : 'Markdown', 
            reply_markup : { inline_keyboard : getPrivacKeyboard }
    })
})
getPrivacy.action('public', async (ctx) => {
    ctx.session.privacy = 'Public';
    ctx.session.privacyno = 0;
    await ctx.deleteMessage()
    ctx.reply("Privacy settings updated.")

    ctx.scene.leave('getPrivacy');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
getPrivacy.action('unlisted', async (ctx) => {
    ctx.session.privacy = 'Unlisted';
    ctx.session.privacyno = 1;
    await ctx.deleteMessage()
    ctx.reply("Privacy settings updated.")

    ctx.scene.leave('getPrivacy');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
getPrivacy.action('private', async (ctx) => {
    ctx.session.privacy = 'Private';
    ctx.session.privacyno = 2;
    await ctx.deleteMessage()
    ctx.reply("Privacy settings updated.")

    ctx.scene.leave('getPrivacy');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
getPrivacy.action('cancel', async (ctx) => {
    await ctx.deleteMessage()
    ctx.reply("No changes made.")
    ctx.scene.leave('getPrivacy');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})


getExpiry.enter((ctx) => {
    ctx.reply(`Choose a Expiry period from below.\nCurrent Expiry Status is ${ctx.session.expiry}`,
        {   parse_mode : 'Markdown', 
            reply_markup : { inline_keyboard : [
                [{text : 'Never',callback_data : 'never'}],
                [{text : '10 Minutes',callback_data : 'min10'}],
                [{text : '1 Hour',callback_data : 'hour1'}],
                [{text : '1 Day',callback_data : 'day1'}],
                [{text : '1 Week',callback_data : 'week1'}],
                [{text : '2 Weeks',callback_data : 'week2'}],
                [{text : '1 Month',callback_data : 'month1'}],
                [{text : 'cancel',callback_data : 'cancel'}]
            ]
        }
    })
})

getExpiry.action('never', async (ctx) => {
    ctx.session.expires = 'Never';
    ctx.session.expirescode = 'N';
    await ctx.deleteMessage();
    ctx.reply("Expiry settings updated.")

    ctx.scene.leave('getExpiry');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
getExpiry.action('min10', async (ctx) => {
    ctx.session.expires = '10 Minutes';
    ctx.session.expirescode = '10M';
    await ctx.deleteMessage();
    ctx.reply("Expiry settings updated.")

    ctx.scene.leave('getExpiry');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
getExpiry.action('hour1', async (ctx) => {
    ctx.session.expires = '1 Hour';
    ctx.session.expirescode = '1H';
    await ctx.deleteMessage();
    ctx.reply("Expiry settings updated.")

    ctx.scene.leave('getExpiry');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
getExpiry.action('day1', async (ctx) => {
    ctx.session.expires = '1 Day';
    ctx.session.expirescode = '1D';
    await ctx.deleteMessage();
    ctx.reply("Expiry settings updated.")

    ctx.scene.leave('getExpiry');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
getExpiry.action('week1', async (ctx) => {
    ctx.session.expires = '1 Week';
    ctx.session.expirescode = '1W';
    await ctx.deleteMessage();
    ctx.reply("Expiry settings updated.")

    ctx.scene.leave('getExpiry');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
getExpiry.action('week2', async (ctx) => {
    ctx.session.expires = '2 Weeks';
    ctx.session.expirescode = '2W';
    await ctx.deleteMessage();
    ctx.reply("Expiry settings updated.")

    ctx.scene.leave('getExpiry');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
getExpiry.action('month1', async (ctx) => {
    ctx.session.expires = '1 Month';
    ctx.session.expirescode = '1M';
    await ctx.deleteMessage();
    ctx.reply("Expiry settings updated.")

    ctx.scene.leave('getExpiry');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
getExpiry.action('cancel', async (ctx) => {
    await ctx.deleteMessage();
    ctx.reply("No changes made.")
    ctx.scene.leave('getExpiry');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})

guest.action('paste-guest', (ctx) => {
    const msg = ctx.update.callback_query.message;
    paste.create({
        contents: ctx.session.paste,
        name: ctx.session.name,
        expires : ctx.session.expirescode,
        format : ctx.session.format,
        privacy : ctx.session.privacyno
    }, function(success, data) {
        if(success) {
            const raw = "https://pastebin.com/raw/" + data.split('/')[3];
            ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                `The Paste [${ctx.session.name}](${data}) has been Successfully Pasted at ${data}`, { parse_mode : "Markdown", reply_markup: { inline_keyboard : [[{text : "See on browser", url : data }], [{text : "RAW Data", url : raw }, { text : 'Embed Codes', url : `http://t.me/dctesterbot?start=emb_${data.split('/')[3]}` }]]}
            });
        } else {
            ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                `Some kind of error occurred. Error Data : ${data}`, { parse_mode : "Markdown" }
            );
        }
    });
})

bot.launch({
  webhook: {
    domain: process.env.BOT_DOMAIN,
    port: process.env.PORT
  }
})
