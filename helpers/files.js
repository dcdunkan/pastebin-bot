const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const config = require("../config");

function createTemp(ctx){
    fs.mkdir(path.join('./temp/', ctx.message.chat.id.toString()), { recursive : true }, async (err) => {
        if(err){
            console.log(err)
        } else {
            fs.writeFile(`./temp/${ctx.message.chat.id}/${ctx.message.text}`, `tmp\nuid:${ctx.message.chat.id}`, async function (err) {
                if(err){
                    ctx.reply('Looks like the filename you have entered is not a valid filename in file system. Please enter a new valid filename which contains only the supported characters.')
                } else {
                    ctx.reply('Click the button below to start download. After downloading as a file, it will automatically upload the file for you.', { reply_markup : { inline_keyboard : [[{ text: 'Download', callback_data : 'dl' }]] }})
                    ctx.session.filename = ctx.message.text
                    fs.unlink(`./temp/${ctx.message.chat.id}/${ctx.message.text}`, (err => {
                        if (err) {console.log(err)}
                    }))
                }
            })
        }
    })
}
async function upload(ctx){
    const msg = ctx.update.callback_query.message;
    await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, `Creating file...`)
    fs.mkdir(path.join('./users/downloads/', msg.chat.id.toString()), { recursive : true }, async (err) => {
        if (err) { 
            ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, `File creation failed.`)
            ctx.scene.leave('datadl')
            return console.error(err);
        } else {
            fs.writeFile(`./users/downloads/${msg.chat.id}/${ctx.session.filename}`, ctx.session.dl_data, async function (err){
                if (err) {
                    ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, `File creation failed.`)
                    ctx.scene.leave('datadl')
                    throw err;
                } else {
                    await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'File created successfully.')
                    await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, msg.message_id, 'Uploading...')
                    await ctx.replyWithDocument({
                        source: fs.createReadStream(`./users/downloads/${msg.chat.id}/${ctx.session.filename}`),
                        filename : ctx.session.filename
                    })
                    fs.unlink(`./users/downloads/${msg.chat.id}/${ctx.session.filename}`, (err => {
                        if (err) {
                            console.log(err)
                            ctx.scene.leave('datadl')
                        }
                    }))
                    ctx.scene.leave('datadl')
                }
            })
        }
    })
    ctx.scene.leave('datadl')
}
async function download(ctx){
    const doc = ctx.message.document;
    if(doc.mime_type.split('/')[0] == 'text' || config.doc_formats.includes(doc.mime_type)){
        ctx.telegram.getFileLink(doc.file_id)
        .then(async (result) => {
             await fs.mkdir(`./users/uploads/${ctx.message.chat.id}`, { recursive: true }, async (err) => {
                if (err) {
                    await ctx.reply('error occurred.')
                    throw err;
                }
            }) 
            await fetch(result)
            .then(async (res) => {
                const dest = await fs.createWriteStream(`./users/uploads/${ctx.message.chat.id}/${doc.file_unique_id}${doc.file_name}`);
                await res.body.pipe(dest);
                ctx.session.filedest = `./users/uploads/${ctx.message.chat.id}/${doc.file_unique_id}${doc.file_name}`
                ctx.session.file = true;
                await ctx.reply('The paste is added. Now you can continue with other steps.')
                await ctx.scene.enter('getName')
            })
            .catch((err) => {
                ctx.reply('Some kind of error occurred. Please try again later.')
                console.log(err)
            })
        })
        .catch((err) => {
            ctx.reply('Some kind of error occurred. Please try again later.')
            console.log(err)
        })
    } else {
        ctx.reply('Please send a file that type of text.')
    } 
}


module.exports = { createTemp, download, upload }