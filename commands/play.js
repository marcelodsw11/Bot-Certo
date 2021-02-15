const ytSearch = require("yt-search");
const ytdl = require("ytdl-core-discord");
const ytdlcore = require("ytdl-core");
const ytpl = require("ytpl");

const messsageHandler = async (message) => {
    const content  = message.content;
    const songList = [];
    if(!content) return;
    if(content.includes("http")){
        if(!content.includes("playlist")){
            songList.push(content.replace(/\s/g,"").substr(2));
            return songList;
        } else {
            const playlist = await ytpl(content.substr(content.indexOf("=")+1));
            var newSongList = songList.concat(playlist.items.map((elem)=> {
                return elem.url;
            }));
            return newSongList;
        }
    } else {

        const songUrlByName = await ytSearch(content.substr(2));
        if(!songUrlByName) {
            message.reply("Música não encontrada, tente novamente");
            return;
        }
        songList.push(songUrlByName.videos[0].url);
        return songList;

        
    }
}

const play = async (serverQueue,message) => {
    if (!message.member.voice.channel)
        return message.channel.send(
        "Você precisa estar em um canal de voz"
        );
    const permissions = message.member.voice.channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
        "O bot não possui permissão para entrar nesse canal de voz ou o canal de voz não permite ao bot tocar"
        );
    }
    if(!serverQueue.songs[0]) {
        setTimeout(()=> serverQueue.voiceChannel.leave(), 1800000);
        return serverQueue;
    }
    serverQueue.dispatcher = await serverQueue.connection
    .play(await ytdl(serverQueue.songs[0],{filter: "audioonly" }),
    {
      type: "opus",
    })
    .on("finish", () => {
        serverQueue.songs.shift();
        play(serverQueue,message)
    })
    .on("error", error => console.error(error));
  serverQueue.dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  var songInfo = await ytdlcore.getInfo(serverQueue.songs[0]);
  message.channel.send(`Começando a tocar: **${songInfo.videoDetails.title}**`);

}

const execute = async(message, queue) => {

    const queueReciver = queue;

    let serverQueue = queue.get(message.guild.id);
    const SongArr = await messsageHandler(message);
    if(!serverQueue) {
        queueConstructor = {
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
            dispatcher: null
        };
        queueReciver.set(message.guild.id, queueConstructor);
        serverQueue = queue.get(message.guild.id);
    }
    if(!SongArr) return queueReciver
    if(!serverQueue.songs) serverQueue.songs =[];
    serverQueue.songs = serverQueue.songs.concat(SongArr);
    var connection = await message.member.voice.channel.join();
    serverQueue.connection = connection;
    const newQueue = play(serverQueue, message);
    serverQueue = await newQueue;
    queueReciver.set(message.guild.id, serverQueue);
    return queueReciver;
}

const stop = (queue,message) => {
    if (!message.member.voice.channel)
    return message.channel.send(
      "Você tem que estar em um canal de voz para parar a música"
    );
    let serverQueue = queue.get(message.guild.id)
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    return queue.set(message.guild.id, serverQueue)
}

const skip = (queue,message) => {
    let serverQueue = queue.get(message.guild.id)
    console.log(serverQueue)
    if (!message.member.voice.channel) return message.channel.send("Você tem que estar em um canal de voz para parar a música");
  if (!serverQueue) {
    return message.channel.send("Não existe música para pular!");
  }
  serverQueue.connection.dispatcher.end();
  return queue.set(message.guild.id, serverQueue)
}

module.exports = {
    execute,
    stop,
    skip
}