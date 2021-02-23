const queues = new Map()
const ytSearch = require("yt-search")
const ytPlaylist = require("ytpl")
const ytdl = require("ytdl-core-discord")
const {prefix} = require("../config.json")

async function play(message) {
    const serverQueue = queues.get(message.guildID);
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
        queues.delete(message.guildID)
        setTimeout(() =>serverQueue.voiceChannel.leave(),1800000)
        return;
    }
    serverQueue.playing = true
    queues.set(message.guildID, serverQueue)
    serverQueue.dispatcher = await serverQueue.connection
    .play(await ytdl(serverQueue.songs[0],{filter: "audioonly" }),
    {
      type: "opus",
    })
    .on("finish", () => {
        serverQueue.songs.shift();
        serverQueue.playing = false;
        queues.set(message.guildID, serverQueue)
        play(message);
    })
    .on("error", error => console.error(error));
    serverQueue.dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    var songInfo = await ytdl.getInfo(serverQueue.songs[0]);
    message.channel.send(`Começando a tocar: **${songInfo.videoDetails.title}**`);
}

async function execute(message) {
    const queueExist = queues.get(message.guildID);
    if(!queueExist) {
        const queueConstructor = {
            connection: null,
            songs: [],
            volume: 5,
            playing: false,
            dispatcher: null,
            voiceChannel: null
        };
        queues.set(message.guildID, queueConstructor);
    }
    const messageTreated = message.content.substr(6);
    const newQueue = queues.get(message.guildID);
    if(messageTreated.startsWith("http")) {
        if(messageTreated.includes("playlist")) {
            const playlistSearched = await ytPlaylist(messageTreated)
            playlistSearched.items.forEach(element => {
                newQueue.songs.push(element.url);
            });
        }
        else {
            newQueue.songs.push(messageTreated);
        }
    }
    else {
        try {
            const ytSearchSong = await ytSearch(messageTreated);
            newQueue.songs.push(ytSearchSong.videos[0].url);
        } catch (error) {
            message.channel.send("Musica não encontrada. Tente Novamente");
        }
        const ytSearchSong = await ytSearch(messageTreated);
        newQueue.songs.push(ytSearchSong);
    }
    newQueue.voiceChannel = message.member.voice.channel;
    newQueue.connection = await newQueue.voiceChannel.join();
    queues.set(message.guildID, newQueue);
    message.channel.send("Música(s) adicionada(s) à fila");
    if(!newQueue.playing) {
        play(message);
    }
}

function skip(message) {
    const skipQueue = queues.get(message.guildID);
    if(skipQueue) {
        skipQueue.songs.shift();
        queues.set(message.guildID, skipQueue);
        play(message);
    }
    else {
        message.channel.send("Não há nenuma música para pular");
    }
}

function stop(message) {
    const stopQueue = queues.get(message.guildID);
    if(stopQueue) {
        stopQueue.songs = [];
        queues.set(message.guildID, stopQueue);
        play(message);
    }
    else {
        message.channel.send("Não há nenuma música tocando no momento");
    }
}


module.exports ={
    songAdd: (client) => {
        client.on("message", (message)=> {
            if(message.author.bot)return;
            if(!message.content.startsWith(`${prefix}`)) return;
            if(message.content.startsWith(`${prefix}play`)) {
                execute(message);
            }
        })
    },
    skipSong : (client) => {
        client.on("message", (message) => {
            if(message.author.bot)return;
            if(!message.content.startsWith(`${prefix}`)) return;
            if(message.content.startsWith(`${prefix}skip` || `${prefix}pular`)) {
                skip(message);
            }
        })
    },
    stopSong : (client) => {
        client.on("message", (message) => {
            if(message.author.bot)return;
            if(!message.content.startsWith(`${prefix}`)) return;
            if(message.content.startsWith(`${prefix}stop` || `${prefix}parar`)) {
                stop(message);
            }
        })
    } 
}