const express = require("express");
const {token,prefix} = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const helpCommand = require("./commands/help");
const cors = require("cors");
const status = false;
const queues = new Map();
const statusResult = {
    token: null,
    stats: null,
    prefix: "*"
};
const newplay = require("./commands/newplay");
const app = express();
app.use(cors());

if(status) {
    statusResult.token = token.main;
    statusResult.stats = {name:"Testando os Comandos", type: "PLAYING"};
}
else {
    statusResult.token = token.teste;
    statusResult.stats = {name: "Pronto para Tocar", type: "LISTENING"};
    statusResult.prefix = "&"
}

client.once("ready", () => {
    console.log(`Bot ${client.user.username} Online`)
    newplay.music(client);
    helpCommand(client);
    client.user.setPresence({
        status: "online",
        activity: statusResult.stats
    })
    app.get("/music",(req,res)=> {
        if(newplay.queues()) {
            res.send(newplay.queues().songs[0]);
            return;
        }
        res.send({title:null})
        
    })
})

app.use("/",express.static('public'));


app.listen(process.env.PORT || 5001);

client.login(statusResult.token);
