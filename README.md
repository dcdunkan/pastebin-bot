#### I know that this code is not perfect. Even good. I am a beginner, so please ignore them. I will be correcting them while i go forward. Please star this if you liked it.
# $ pastebin-bot.js
Advanced functional Pastebin Telegram Bot made using <a href="https://npmjs.com/package/better-pastebin">better-pastebin</a> and <a href="https://npmjs.com/package/telegraf">TelegrafJS</a>. This bot will help you to create pastes (Texts) on [Pastebin](https://pastebin.com) <sup id="footn1">[[1]](#pastebin-description)</sup> which is a text cloud. Here is a running example of the bot <a href="https://telegram.me/pstbinbot">@pstbinbot</a> on telegram.

#### contents
[How to use?](#-how-to-use) | [Deploy](#-deploy) | [To-Do](#-to-do) | [Any Ideas?](#-contribute)

### $ how to use?
* Go to [@pstbinbot](https://telegram.me/pstbinbot)
* Send a **Text** you want to paste.
* Send the **Title** for the paste when the bot asks.
* Then when the bot asks for A *method to paste*, choose an option from them. Either *login and paste*, or *paste as guest*.
* Customize the **optional options** if you want to. Such as *Paste Expiry*, *Paste exposure (Public/Private/Unlisted)*, and the *syntax*.
* Then the bot will ask you to **confirm the paste** if you are pasting as a guest. Or it will ask for username and password to login and paste. We won't be either storing or logging your both username and password. The bot will save them to it's session storage, and delete your messages after you send them. Also, the bot will set the values to undefined after pasting.
* After pasting, you will get a link for the paste. Also you can generate embed links for the paste.

### $ deploy
Simply deploy the application to heroku by clicking the button below. You will need a **telegram bot token**, a **pastebin developer key**, and your **application's subdomain or the domain** you are using. Read below to find how to get all the values.
* `BOT_TOKEN` : Get this value from [BotFather](https://telegram.me/botfather) on telegram by creating a new bot.
* `PASTE_DEVKEY` : You can get this value from [here](https://pastebin.com/doc_api#1) after logging into pastebin.
* `BOT_DOMAIN` : Set this value to `<yourappname>.herokuapp.com`. Or if you are using a custom domain, enter it without `https://` or slash `'/'` at the end.


[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/dcdunkan/pastebin-bot)

### $ to-do
- [x] Log in and paste mode.
- [x] Option to customize the optional values such as expiry, exposure, syntax.
- [x] Get the embed code.
- [ ] Download the paste as a file.
- [ ] Create a paste from file.
- [ ] List a user's paste. And list command to list the pastes made with the bot.
- [ ] Settings tab for setting default values to the optionals.
- [ ] Characters more than 4096 (Telegram's limit).
- [ ] Getting a paste's content.
- [ ] More commands.

### $ contribute
Please make an issue or pull a request if you got any ideas. Also, this project is completely open-source. You can fork it and edit as you want. Also, do not forget to give it a star.

<a href="#footn1" id="pastebin-description">[1]</a>: Pastebin.com is the number one paste tool since 2002. Pastebin is a website where you can store text online for a set period of time.

[Go back to top ^](#-pastebin-botjs)
