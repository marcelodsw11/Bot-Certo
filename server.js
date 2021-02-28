const express = require("express");
const {token,prefix} = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const helpCommand = require("./commands/help");
const status = false;
const statusResult = {
    token: null,
    stats: null,
    prefix: "*"
};
const newplay = require("./commands/newplay");
const app = express();

if(status) {
    statusResult.token = token.main;
    statusResult.stats = {name:"Testando os Comandos", type: "PLAYING"};
}
else {
    statusResult.token = token.teste;
    statusResult.stats = {name: "Pronto para Tocar", type: "LISTENING"};
    statusResult.prefix = "&"
}

client.queues = new Map();

client.once("ready", () => {
    console.log(`Bot ${client.user.username} Online`)
    newplay(client);
    helpCommand(client);
    client.user.setPresence({
        status: "online",
        activity: statusResult.stats
    })
})

app.use("/",express.static('public'));

app.listen(process.env.PORT || 5001);

client.login(statusResult.token);

module.exports = statusResult.prefix;