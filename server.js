const express = require("express");
const {token} = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const helpCommand = require("./commands/help");
const cors = require("cors");
const status = true;
const statusResult = {
    token: null,
    stats: null,
    prefix: "*"
};
const newplay = require("./commands/newplay");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
http.listen(process.env.PORT || 5001,(req,res) => console.log("Server ON"));
app.use(cors());

if(status) {
    statusResult.token = token.main;
    statusResult.stats = {name: "Pronto para Tocar", type: "LISTENING"};
}
else {
    statusResult.token = token.teste;
    statusResult.prefix = "&"
    statusResult.stats = {name:"Testando os Comandos", type: "PLAYING"};
}

client.once("ready", () => {
    console.log(`Bot ${client.user.username} Online`)
    newplay.music(client);
    helpCommand(client);
    client.user.setPresence({
        status: "online",
        activity: statusResult.stats
    });
})

app.use("/public",express.static("public"));
app.use("/",(req,res)=> {
    res.sendFile(__dirname+"/bot.html")
})

function data(eventData,data) {
    io.emit(eventData,data);
}
client.login(statusResult.token);
io.on("connection",async (socket) => {
    console.log(socket.id)
    let queueMusic;
        queueMusic = newplay.queues();
    if(queueMusic) {
        socket.emit("world", queueMusic.songs[0]);
    }else {
        socket.emit("world", {title:null, url:null});
    }
})
newplay.subscribe(data)

