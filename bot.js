require('dotenv').config()
const config = require("./config");
const { writeifnot } = require('./helpers/firebase')
const files = require('./helpers/files')

const paste = require("better-pastebin");
paste.setDevKey(process.env.PASTE_DEVKEY);

const { Telegraf } = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const bot = new Telegraf(process.env.BOT_TOKEN, {telegram: {webhookReply: false}});

// Scene Manager
const stage = new Stage();

// Scene Registration
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

const changeName = new Scene('changeName');
stage.register(changeName);
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

const datadl = new Scene('datadl');
stage.register(datadl);

// Session
bot.use(session());
bot.use(stage.middleware());

const log_channel = parseInt(process.env.LOG_CHANNEL)

async function ownerLog(method, msg){
    if(log_channel !== undefined){
        // You will get an error if the log chat/channel id is not accessible by bot.
        // To not get that error provide the channel id where your bot is an admin, or a chat id that chatted previously with th bot.
        // The error will be : chat not found.

        // method as a string "Start", "Error", "Pasted"
        const message = `[Pastebin Bot](https://telegram.me/${process.env.BOT_USERNAME})\n*${method}*\n${msg}\n\n#pastebin`
        bot.telegram.sendMessage(log_channel, message, { parse_mode : 'Markdown', disable_web_page_preview : true })
    } else {
        console.log('To log user actions, provide a chat ID, or channel ID where the bot is an admin.')
    }
}

ownerLog('Launch', 'Bot started.')

bot.start(async (ctx) => {
    const match = ctx.message.text.split(' ')[1];
    if(match === undefined){
        ctx.reply( config.msg.start_msg, config.msgopts.start_msg_opts )
        writeifnot(ctx.message.chat.id, ctx.message.chat.username)
    } else if(match.split('_')[0] == 'emb'){
        const paste_id = match.split('_')[1];
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
                ctx.reply(embed_message, config.msgopts.embed_msg_opts)
            } else {
                ctx.reply(config.msg.start_msg_no_emb_msg)
            }
        });
    } else if(match.split('_')[0] == 'dl'){
        const paste_id = match.split('_')[1];
        paste.get(paste_id, function(success, data){
            if(!success){
                ctx.reply(config.msg.start_msg_no_emb_msg)
            } else {
                ctx.session.dl_data = data
                ctx.scene.enter('datadl')
                ctx.session.pasteiddl = paste_id
            }
        })
    } else {
        ctx.reply( config.msg.start_msg, config.msgopts.start_msg_opts )
        writeifnot(ctx.message.chat.id, ctx.message.chat.username)
    }
})

datadl.enter((ctx) => {
    ctx.reply(`Please enter a filename with the extension to download the [requested paste](https://pastebin.com/${ctx.session.pasteiddl}) as a file.`, { parse_mode : 'Markdown' })
})

datadl.on('text', async (ctx) => {
    files.createTemp(ctx)
})

datadl.action('dl', async (ctx) => {
    files.upload(ctx)
})

bot.command('config', (ctx) => {
    ctx.reply( "*This feature is not completed yet*.\nThis feature will let you set your default configuration. Such as default syntax, and others. Also, you can store your username. And you won't have to type it again and again. But, we won't ask or save your password.", { parse_mode : 'Markdown' })
})

bot.action('create', async (ctx) => {
    ctx.scene.enter('getPaste');
})
bot.action('help', (ctx) => {
    const msg = ctx.update.callback_query.message
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.help_msg, config.msgopts.help_msg_opts)
})
bot.action('about', (ctx) => {
    const msg = ctx.update.callback_query.message
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.about_msg, config.msgopts.about_msg_opts)
})
bot.action('home', (ctx) => {
    const msg = ctx.update.callback_query.message
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.start_msg, config.msgopts.start_msg_opts )
})
bot.action('pastebin-w', (ctx) => {
    const msg = ctx.update.callback_query.message
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.pastebin_what_msg, { parse_mode : 'Markdown', reply_markup: { inline_keyboard : [[ { text: '< Go back', callback_data: 'about' } ]] } })
})
bot.action('source-code', (ctx) => {
    const msg = ctx.update.callback_query.message
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.source_code_msg, config.msgopts.source_code_opts )
})
bot.action('01', (ctx) => {
    const msg = ctx.update.callback_query.message;
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.help_1_msg, config.msgopts.help_1_opts)
})
bot.action('02', (ctx) => {
    const msg = ctx.update.callback_query.message;
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.help_2_msg, config.msgopts.help_2_opts )
})
bot.action('03', (ctx) => {
    const msg = ctx.update.callback_query.message;
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.help_3_msg, config.msgopts.help_3_opts )
})
bot.action('04', (ctx) => {
    const msg = ctx.update.callback_query.message;
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.help_4_msg, config.msgopts.help_4_opts )
})
bot.action('05', (ctx) => {
    const msg = ctx.update.callback_query.message;
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.help_5_msg, config.msgopts.help_5_opts )
})
bot.action('06', (ctx) => {
    const msg = ctx.update.callback_query.message;
    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, config.msg.help_6_msg, config.msgopts.help_6_opts )
})


// cancel command section
bot.command('cancel', (ctx) => ctx.reply("No process running to get cancelled."))
getPaste.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('getPaste')
})
getName.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('getName')
})
method.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('method')
})
guest.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('guest')
})
login.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('login')
})
loginPaste.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('loginPaste')
})
changeName.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('changeName')
    if(ctx.session.isGuest == true){
        ctx.scene.leave('guest')
    } else {
        ctx.scene.leave('login')
    }
})
getExpiry.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('getExpiry')
    if(ctx.session.isGuest == true){
        ctx.scene.leave('guest')
    } else {
        ctx.scene.leave('login')
    }
})
getSyntax.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('getSyntax')
    if(ctx.session.isGuest == true){
        ctx.scene.leave('guest')
    } else {
        ctx.scene.leave('login')
    }
})
getPrivacy.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('getPrivacy')
    if(ctx.session.isGuest == true){
        ctx.scene.leave('guest')
    } else {
        ctx.scene.leave('login')
    }
})
getUsername.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('getUsername')
})
getPass.command('cancel', async (ctx) =>{
    await ctx.reply(config.msg.cancelled_msg)
    ctx.session.paste = ""
    ctx.scene.leave('getPass')
})
datadl.command('cancel', async (ctx) =>{
    await ctx.reply('Cancelled download.')
    ctx.scene.leave('datadl')
})


bot.command('create', async (ctx) => {
    ctx.session.paste = ""
    ctx.scene.enter('getPaste')
})
bot.help((ctx) => {
    ctx.reply( config.msg.help_msg, config.msgopts.help_msg_opts )
})
bot.command('about', (ctx) => {
    ctx.reply( config.msg.about_msg, config.msgopts.about_msg_opts )
})
bot.on('text', (ctx) => {
    ctx.session.paste = ctx.message.text;
    ctx.scene.enter('getPaste')
})

bot.on('document', async (ctx) => {
    files.download(ctx)
})

getPaste.enter((ctx) => {
    if(ctx.session.paste === undefined || ctx.session.paste == ""){
        ctx.session.paste = "";
        ctx.reply("*Send the paste*.Your paste will be what you enter. There won't be any watermarks or anything created by us. And, we support unlimited characters. Send your paste in many messages as you wanted. Enter /done after you have sent everything.\nSend /cancel to cancel this process.", { parse_mode : "Markdown" })
    } else {
        ctx.reply('Text added. Send more to add to the paste. Enter /done after you have entered everything.')
    }
})

getPaste.command('done', (ctx) => {
    if(ctx.session.paste == "" || ctx.session.paste === undefined){
        ctx.reply("Your paste is empty. Please enter something to create a valid paste.")
    } else {
        ctx.scene.leave('getPaste')
        ctx.scene.enter('getName')
    }
})

getPaste.on('text', async (ctx) => {
    ctx.session.paste = ctx.session.paste + ctx.message.text;
    await ctx.reply('Text added. Send more to add to the paste. Enter /done after you have entered everything.')
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


guest.enter(async (ctx) => {
    await ctx.reply('Please wait...', { reply_markup: { remove_keyboard: true } })
    ctx.reply(`So, you are ready to *paste as a guest*. Change the options if you want to.\nCurrent Status\nName : ${ctx.session.name}\nSyntax : ${ctx.session.format}\nPrivacy : ${ctx.session.privacy}\nExpires : ${ctx.session.expires}\n`,
        {   parse_mode : 'Markdown',
            reply_markup : {
                inline_keyboard : [
                    [{ text: `Change Name`, callback_data: 'name' }],
                    [{ text: `Change Syntax`, callback_data: 'format' }],
                    [{ text: `Change Exposure/Privacy`, callback_data: 'privacy' }],
                    [{ text: `Change Expiry`, callback_data: 'expiry' }],
                    [{ text: '✔️ Done', callback_data: 'done-opts' }]
                ]
            }
        });
})
login.enter(async (ctx) => {
    await ctx.reply('Please wait...', { reply_markup: { remove_keyboard: true } })
    ctx.reply(`So, you are ready to *login and paste*. Change the options if you want to.\nCurrent Status\nName : ${ctx.session.name}\nSyntax : ${ctx.session.format}\nPrivacy : ${ctx.session.privacy}\nExpires : ${ctx.session.expires}\n`,
        {   parse_mode : 'Markdown',
            reply_markup : { 
                inline_keyboard : [
                    [{ text: `Change Name`, callback_data: 'name' }],
                    [{ text: `Change Syntax`, callback_data: 'format' }],
                    [{ text: `Change Exposure/Privacy`, callback_data: 'privacy' }],
                    [{ text: `Change Expiry`, callback_data: 'expiry' }],
                    [{ text: '✔️ Done', callback_data: 'done-opts' }]
                ]
            }
        }
    );
})


guest.action('name', async (ctx) => {
    await ctx.deleteMessage()
    ctx.scene.enter('changeName')
})
login.action('name', async (ctx) => {
    await ctx.deleteMessage()
    ctx.scene.enter('changeName')
})
guest.action('format', async (ctx) => {
    await ctx.deleteMessage()
    ctx.scene.enter('getSyntax')
})
login.action('format', async (ctx) => {
    await ctx.deleteMessage()
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
    ctx.reply("You are ready to login and paste. Send your *USERNAME* of Pastebin. If you haven't created a account yet, please create one from [here](https://pastebin.com/signup). If you are entering an invalid username, the paste creation will be crashed.", { parse_mode : 'Markdown' });
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
getPass.enter((ctx) => ctx.reply('*Send the password* for the account now.\nDonot worry about security. We are not storing your password or username, even the paste. Also, you will be able to monitor any security issues through your mail.\nHit /cancel to cancel this process.', { parse_mode : "Markdown", disable_web_page_preview: true }))
getPass.on('text', async (ctx) => {
    ctx.session.pass = ctx.message.text;
    await ctx.deleteMessage();
    await ctx.reply('Password saved in session storage.')
    ctx.scene.leave('getPass');
    ctx.scene.enter('loginPaste')
})

loginPaste.enter((ctx) => ctx.reply("Click the button to confirm your paste by logging in. It may take upto 10 seconds. Please be patient. Thankyou for using our service. ", { reply_markup : {inline_keyboard : [[{ text : "Login and Paste", callback_data :'login-paste' }]] }}))
loginPaste.action('login-paste', async (ctx) => {
    const msg = ctx.update.callback_query.message;
    await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Connecting...')
    paste.login(ctx.session.username, ctx.session.pass, async function(success, data) {
        await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Trying to login...')
        if(!success) {
            ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Some error occurred while logging in. Please try again later. Make sure that the username and password is correct.')
            ctx.session.username = ""
            ctx.session.pass = ""
            console.log(data)
        } else {
            await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Loggged in successfully.')
            await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Pasting...')
            if (!ctx.session.file){
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
                            `The Paste [${ctx.session.name}](${data}) has been Successfully Pasted at ${data}`, { parse_mode : "Markdown", reply_markup: { inline_keyboard : [[{text : "See on browser", url : data }], [{text : "RAW Data", url : raw }, { text : 'Embed Codes', url : `http://t.me/${process.env.BOT_USERNAME}?start=emb_${data.split('/')[3]}` }], [{ text: 'Download paste as file', url : `https://t.me/${process.env.BOT_USERNAME}?start=dl_${data.split('/')[3]}` }]]}});
                        ctx.session.username = ""
                        ctx.session.pass = ""
                        ctx.session.paste = ""
                        ownerLog('Created a paste successfully', `[${msg.chat.id}](tg://user?id=${msg.chat.id}) Pasted with text(${ctx.session.format}) as ${ctx.session.privacy}\n*Expiry*: ${ctx.session.expires}.\n${data}\nLogin mode : true`)
                    } else {
                        ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                            `Some kind of error occurred. Error Data : ${data}`, { parse_mode : "Markdown" });
                        ctx.session.username = ""
                        ctx.session.pass = ""
                        ctx.session.paste = ""
                        ownerLog('Paste failed.', `[${msg.chat.id}](tg://user?id=${msg.chat.id}) Paste creation failed with text(${ctx.session.format}) as ${ctx.session.privacy}\n*Expiry*: ${ctx.session.expires}.\n${data}\nLogin mode : true`)
                        console.log(data)
                    }
                });
            ctx.scene.leave('loginPaste')
            } else {
                await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Reading file...')  
                await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Creating paste...')
                await paste.createFromFile({
                    path : ctx.session.filedest,
                    name: ctx.session.name,
                    expires : ctx.session.expirescode,
                    format : ctx.session.format,
                    privacy : ctx.session.privacyno
                }, async function(success, data) {
                    if(success){
                        const raw = "https://pastebin.com/raw/" + data.split('/')[3]
                        await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id,
                            `The Paste [${ctx.session.name}](${data}) has been Successfully Pasted at ${data}`,
                            { parse_mode : "Markdown", reply_markup: { inline_keyboard : [[{text : "See on browser", url : data }], [{text : "RAW Data", url : raw }, { text : 'Embed Codes', url : `http://t.me/${process.env.BOT_USERNAME}?start=emb_${data.split('/')[3]}` }]]}});
                        ctx.session.username = ""
                        ctx.session.pass = ""
                        ctx.session.paste = ""
                        ownerLog('Created a paste successfully', `[${msg.chat.id}](tg://user?id=${msg.chat.id}) Pasted with file(${ctx.session.format}) as ${ctx.session.privacy}\n*Expiry*: ${ctx.session.expires}.\n${data}\nLogin mode : true`)
                    } else {
                        ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                            `Some kind of error occurred. Error Data : ${data}`, { parse_mode : "Markdown" });
                        ctx.session.username = ""
                        ctx.session.pass = ""
                        ctx.session.paste = ""
                        ownerLog('Paste failed.', `[${msg.chat.id}](tg://user?id=${msg.chat.id}) Paste creation failed with file(${ctx.session.format}) as ${ctx.session.privacy}\n*Expiry*: ${ctx.session.expires}.\n${data}\nLogin mode : true`)
                        console.log(data)
                    }
                });
                ctx.scene.leave('loginPaste')
            }
        }
    });
})

changeName.enter((ctx) => {
    ctx.reply( `Send a new name/title for your paste. Current name is ${ctx.session.name}. Or go back to discard changes.`, { parse_mode : 'Markdown', disable_web_page_preview : true, reply_markup: { inline_keyboard : [[ { text : '< Go back', callback_data : 'cancel' } ]] } })
})
changeName.on('text', async (ctx) => {
    ctx.session.name = ctx.message.text;
    await ctx.reply('Name changed successfully.')
    ctx.scene.leave('changeName');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})
changeName.action('cancel', async (ctx) => {
    await ctx.deleteMessage()
    ctx.reply("No changes made.")
    ctx.scene.leave('changeName');
    if(ctx.session.isGuest == true){
        ctx.scene.enter('guest')
    } else {
        ctx.scene.enter('login')
    }
})

getSyntax.enter((ctx) => {
    ctx.reply(`Send a new syntax formatting to continue.\nCurrent Syntax is setted to : *${ctx.session.format}*\n\nIf you don't know which are these available syntaxes, check this [page](https://pastebin.com/doc_api#5) and enter a valid one. Or it will get an error`, { parse_mode : 'Markdown', disable_web_page_preview : true, reply_markup: { inline_keyboard : [[ { text : '< Go back', callback_data : 'cancel' } ]] } })
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
getSyntax.action('cancel', async (ctx) => {
    await ctx.deleteMessage()
    ctx.reply("No changes made.")
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

guest.action('paste-guest', async (ctx) => {
    const msg = ctx.update.callback_query.message;
    await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Connecting...')
    await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Pasting...')
    if(!ctx.session.file){
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
                       `The Paste [${ctx.session.name}](${data}) has been Successfully Pasted at ${data}`, { parse_mode : "Markdown", reply_markup: { inline_keyboard : [[{text : "See on browser", url : data }], [{text : "RAW Data", url : raw }, { text : 'Embed Codes', url : `http://t.me/${process.env.BOT_USERNAME}?start=emb_${data.split('/')[3]}` }], [{ text: 'Download paste as file', url : `https://t.me/${process.env.BOT_USERNAME}?start=dl_${data.split('/')[3]}` }]]}
                });
                ownerLog('Created a paste successfully', `[${msg.chat.id}](tg://user?id=${msg.chat.id}) Pasted with text(${ctx.session.format}) as ${ctx.session.privacy}\n*Expiry*: ${ctx.session.expires}.\n${data}\nLogin mode : false`)
                ctx.session.paste = ""
                ctx.scene.leave('guest')
            } else {
                ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                    `Some kind of error occurred. Error Data : ${data}`, { parse_mode : "Markdown" }
                );
                ctx.session.paste = ""
                ownerLog('Paste failed.', `[${msg.chat.id}](tg://user?id=${msg.chat.id}) Paste creation failed with text(${ctx.session.format}) as ${ctx.session.privacy}\n*Expiry*: ${ctx.session.expires}.\n${data}\nLogin mode : false`)
                ctx.scene.leave('guest')
                console.log(data)
            }
        });
    } else {
        await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Reading file...')  
        await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Creating paste...')
        await paste.createFromFile({
            path : ctx.session.filedest,
            name: ctx.session.name,
            expires : ctx.session.expirescode,
            format : ctx.session.format,
            privacy : ctx.session.privacyno
        }, async function(success, data) {
            if(success){
                const raw = "https://pastebin.com/raw/" + data.split('/')[3]
                await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id,
                    `The Paste [${ctx.session.name}](${data}) has been Successfully Pasted at ${data}`,
                     { parse_mode : "Markdown", reply_markup: { inline_keyboard : [[{text : "See on browser", url : data }], [{text : "RAW Data", url : raw }, { text : 'Embed Codes', url : `http://t.me/${process.env.BOT_USERNAME}?start=emb_${data.split('/')[3]}` }]]}});
                ctx.session.paste = ""
                ownerLog('Created a paste successfully', `[${msg.chat.id}](tg://user?id=${msg.chat.id}) Pasted with file(${ctx.session.format}) as ${ctx.session.privacy}\n*Expiry*: ${ctx.session.expires}.\n${data}\nLogin mode : false`)
            } else {
                ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                    `Some kind of error occurred. Error Data : ${data}`, { parse_mode : "Markdown" });
                ctx.session.paste = ""
                ownerLog('Paste failed.', `[${msg.chat.id}](tg://user?id=${msg.chat.id}) Paste creation failed with file(${ctx.session.format}) as ${ctx.session.privacy}\n*Expiry*: ${ctx.session.expires}.\n${data}\nLogin mode : false`)
                console.log(data)
            }
         });
         ctx.scene.leave('guest')
    }
})

console.log(`pastebin-bot compiled successfully and now running as @${process.env.BOT_USERNAME}`)
bot.launch({
  webhook: {
    domain: process.env.BOT_DOMAIN,
    port: process.env.PORT
  }
})
