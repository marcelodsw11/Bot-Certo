const express = require("express");
const {token,prefix} = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const music = require("./commands/play");
const helpCommand = require("./commands/help");

client.queues = new Map();

const {newPlay,queueGlobal} = require("./commands/newplay")

client.once("ready", () => {
    console.log("Bot Online")
})

const app = express();
client.on("message",async (message)=> {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    if(message.content.startsWith(`${prefix}p`)) {
        client.queues = await music.execute(message, client.queues);
        return;
    }
    if(message.content.startsWith(`${prefix}skip`)) {
        client.queues = music.skip(client.queues, message);
        return;
    }
    if(message.content.startsWith(`${prefix}stop`)) {
        client.queues = music.stop(client.queues, message);
        return;
    }
    if(message.content.startsWith(`${prefix}help`)) {
        helpCommand(message);
        return;
    }
    if(message.content.startsWith(`${prefix}oi`)) {
        message.channel.send(`Oi eu sou o bot do canal Life™, se quiser ver os comandos digite ${prefix}help`);
        return;
    }
    if(message.content.startsWith(`${prefix}t`)) {
        newPlay(message, client.queues)
    }

})
app.listen(process.env.PORT || 5000);
client.login(token.main);
