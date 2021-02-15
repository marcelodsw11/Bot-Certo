const ytSearch = require("yt-search");
const ytdl = require("ytdl-core-discord");
var newQueue;
var globalQueue = new Map();
const ytdlcore = require("ytdl-core");
const ytpl = require("ytpl");
const skip = require("./skip");
async function execute(id,voiceChannel,queue,serverQueue,songs,message) {
    if(serverQueue){
        newQueue = queue;
        serverQueueHandler(id,voiceChannel,songs)

    }else {
        const queueConstructor = {
            textChannel: message.channel,
            voiceChannel: message.member.voice.channel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };
        
        newQueue = queue.set(id, queueConstructor);
        newQueue.set(id, await serverQueueHandler(id,voiceChannel,songs));
        
        play(newQueue,id, message)
    }
    globalQueue = newQueue;
    console.log(globalQueue)
    newQueue.delete(id);
}

async function play(queue,id,message) {
    var arr = queue.get(id);
    if (!arr.voiceChannel)
        return message.channel.send(
        "Você precisa estar em um canal de voz"
        );
    const permissions = arr.voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
        "O bot não possui permissão para entrar nesse canal de voz ou o canal de voz não permite ao bot tocar"
        );
    }
    
    if(!arr.songs[0]) {
        newQueue.delete(id)
        setTimeout(()=> arr.voiceChannel.leave(), 1800000);
        return;
    }

    const dispatcher = await arr.connection
    .play(await ytdl(arr.songs[0],{filter: "audioonly" }),
    {
      type: "opus",
    })
    .on("finish", () => {
        arr.songs.shift();
        queue.set(id, arr)
        play(queue,id, message);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(arr.volume / 5);
  var songInfo = await ytdlcore.getInfo(arr.songs[0]);
  arr.textChannel.send(`Começando a tocar: **${songInfo.videoDetails.title}**`);

}

async function songFinder(content,id,voiceChannel,queue,serverQueue,message) {

    const res = await ytSearch(content);
    if(!res) return message.channel.send("Musica não encontrada, tente novamente");
    execute(id,voiceChannel,queue,serverQueue,res.all[0].url,message);
}

async function messsageHandler(content,id,voiceChannel,serverQueue,queue,message) {
    if(!content) return;
    if(content.includes("http")){
        if(!content.includes("playlist")){
            execute(id,voiceChannel,queue,serverQueue, [content.replace(/\s/g,"").substr(2)],message)
        } else {
            let songs = [];
            const filt = content.replace(/\s/g, '').substr(2);
            const response = await ytpl(filt.substr(filt.indexOf("=")+1));
                response.items.forEach((elem)=> {
                songs.push(elem.url)
            })
            execute(id,voiceChannel,queue,serverQueue,songs,message);
        }
    } else {
        songFinder(content,id,voiceChannel,queue,serverQueue,message);
    }
}

async function serverQueueHandler(id,voiceChannel,songs) {
    const newServerQueue = newQueue.get(id)
    var connection = await voiceChannel.join();
    newServerQueue.connection = connection;
    newServerQueue.songs = await newServerQueue.songs.concat(songs)
    return newServerQueue
}

module.exports = {
    newPlay: async (message, queue) => {
    
    const id = message.guild.id;
    const content = message.content;
    const serverQueue = queue.get(id);
    const voiceChannel = message.member.voice.channel;
    messsageHandler(content,id,voiceChannel,serverQueue,queue,message);
    }
}