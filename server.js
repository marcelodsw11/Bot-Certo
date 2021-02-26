const express = require("express");
const {token,prefix} = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const helpCommand = require("./commands/help");

client.queues = new Map();

const newplay = require("./commands/newplay");
const { measureText } = require("jimp");

client.once("ready", () => {
    console.log("Bot Online")
    newplay(client);
})

const app = express();
client.on("message",async (message) => {
    if(message.author.bot) return;
    else if(!message.content.startsWith(prefix)) return;
    else if(message.content.startsWith(`${prefix}help`)) {
        helpCommand(message);
        return;
    }
    else if(message.content.startsWith(`${prefix}roi`)) {
        await message.channel.send(``,
            {files: ["https://cdn.discordapp.com/attachments/812141208155193344/814670077902716968/roi.gif"]});
            message.channel.send(`Roi ${message.author.username} né.`);
        message.channel.send(`Eu sou o bot do canal Life™, se quiser ver os comandos digite: ${prefix}help`);
    }
})
app.listen(process.env.PORT || 5001);
client.login(token.main);
