const paste = require("better-pastebin");
paste.setDevKey(process.env.PASTE_DEVKEY);

async function ownerLog(bot, method, msg){
    // method as a string "Start", "Error", "Pasted"
    const message = `[Pastebin Bot](https://telegram.me/pstbinbot)\n*${method}*\n${msg}\n\n#pastebin`
    bot.telegram.sendMessage(process.env.LOG_CHANNEL, message, { parse_mode : 'Markdown', disable_web_page_preview : true })
}

async function guestPaste(ctx) {
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
                       `The Paste [${ctx.session.name}](${data}) has been Successfully Pasted at ${data}`, { parse_mode : "Markdown", reply_markup: { inline_keyboard : [[{text : "See on browser", url : data }], [{text : "RAW Data", url : raw }, { text : 'Embed Codes', url : `http://t.me/pstbinbot?start=emb_${data.split('/')[3]}` }], [{ text: 'Download paste as file', url : `https://t.me/pstbinbot?start=dl_${data.split('/')[3]}` }]]}
                });
                ownerLog('Created a paste successfully', `${msg.chat.id} Pasted with text(${ctx.session.format}) as ${ctx.session.privacy}. ${data}\nLogin mode : false`)
                ctx.session.paste = ""
                ctx.scene.leave('guest')
            } else {
                ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                    `Some kind of error occurred. Error Data : ${data}`, { parse_mode : "Markdown" }
                );
                ctx.session.paste = ""
                ownerLog('Paste failed.', `${msg.chat.id} Paste creation failed with text(${ctx.session.format}) as ${ctx.session.privacy}. ${data}\nLogin mode : false`)
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
                     { parse_mode : "Markdown", reply_markup: { inline_keyboard : [[{text : "See on browser", url : data }], [{text : "RAW Data", url : raw }, { text : 'Embed Codes', url : `http://t.me/pstbinbot?start=emb_${data.split('/')[3]}` }]]}});
                ctx.session.paste = ""
                ownerLog('Created a paste successfully', `${msg.chat.id} Pasted with file as ${ctx.session.privacy}. ${data}\nLogin mode : false`)
            } else {
                ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                    `Some kind of error occurred. Error Data : ${data}`, { parse_mode : "Markdown" });
                ctx.session.paste = ""
                ownerLog('Paste failed.', `${msg.chat.id} Paste creation failed with file as ${ctx.session.privacy}. ${data}\nLogin mode : false`)
                console.log(data)
            }
         });
         ctx.scene.leave('guest')
    }
}

async function loginPaste(ctx) {
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
                            `The Paste [${ctx.session.name}](${data}) has been Successfully Pasted at ${data}`, { parse_mode : "Markdown", reply_markup: { inline_keyboard : [[{text : "See on browser", url : data }], [{text : "RAW Data", url : raw }, { text : 'Embed Codes', url : `http://t.me/pstbinbot?start=emb_${data.split('/')[3]}` }], [{ text: 'Download paste as file', url : `https://t.me/pstbinbot?start=dl_${data.split('/')[3]}` }]]}});
                        ctx.session.username = ""
                        ctx.session.pass = ""
                        ctx.session.paste = ""
                        ownerLog('Created a paste successfully', `${msg.chat.id} Pasted with text(${ctx.session.format}) as ${ctx.session.privacy}. ${data}\nLogin mode : true`)
                    } else {
                        ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                            `Some kind of error occurred. Error Data : ${data}`, { parse_mode : "Markdown" });
                        ctx.session.username = ""
                        ctx.session.pass = ""
                        ctx.session.paste = ""
                        ownerLog('Paste failed.', `${msg.chat.id} Paste creation failed with text(${ctx.session.format}) as ${ctx.session.privacy}. ${data}\nLogin mode : true`)
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
                            { parse_mode : "Markdown", reply_markup: { inline_keyboard : [[{text : "See on browser", url : data }], [{text : "RAW Data", url : raw }, { text : 'Embed Codes', url : `http://t.me/pstbinbot?start=emb_${data.split('/')[3]}` }]]}});
                        ctx.session.username = ""
                        ctx.session.pass = ""
                        ctx.session.paste = ""
                        ownerLog('Created a paste successfully', `${msg.chat.id} Pasted with file as ${ctx.session.privacy}. ${data}\nLogin mode : true`)
                    } else {
                        ctx.telegram.editMessageText( msg.chat.id, msg.message_id, msg.message_id,
                            `Some kind of error occurred. Error Data : ${data}`, { parse_mode : "Markdown" });
                        ctx.session.username = ""
                        ctx.session.pass = ""
                        ctx.session.paste = ""
                        ownerLog('Paste failed.', `${msg.chat.id} Paste creation failed with file as ${ctx.session.privacy}. ${data}\nLogin mode : true`)
                        console.log(data)
                    }
                });
                ctx.scene.leave('loginPaste')
            }
        }
    });
}
module.exports = { guestPaste, loginPaste, ownerLog }