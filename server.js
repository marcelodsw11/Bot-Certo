const express = require("express");
const {token,prefix} = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const music = require("./commands/play");
const helpCommand = require("./commands/help");

client.queues = new Map();

const newplay = require("./commands/newplay");

client.once("ready", () => {
    console.log("Bot Online")
    newplay.songAdd(client);
    newplay.stopSong(client);
    newplay.skipSong(client);
})

const app = express();
client.on("message",async (message)=> {
    if(message.author.bot) return;
    else if(!message.content.startsWith(prefix)) return;
    else if(message.content.startsWith(`${prefix}help`)) {
        helpCommand(message);
        return;
    }
    else if(message.content.startsWith(`${prefix}oi`)) {
        message.channel.send(`Oi eu sou o bot do canal Life™, se quiser ver os comandos digite ${prefix}help`);
        return;
    }
})
app.listen(process.env.PORT || 5001);
client.login(token.main);
