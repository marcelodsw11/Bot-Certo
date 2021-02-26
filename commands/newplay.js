const queues = new Map();
const ytSearch = require("yt-search");
const ytPlaylist = require("ytpl");
const ytdl = require("ytdl-core-discord");
const {prefix} = require("../config.json");

const play = async(message) => {
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
        queues.delete(message.guildID);
        setTimeout(() =>serverQueue.voiceChannel.leave(),18000000);
        return;
    }
    serverQueue.playing = true
    queues.set(message.guildID, serverQueue)
    serverQueue.dispatcher = await serverQueue.connection
    .play(await ytdl(serverQueue.songs[0].url,{filter: "audioonly" }),
    {
      type: "opus",
    })
    .on("finish", () => {
        if(!serverQueue.loop) {
            serverQueue.songs.shift();
        }
            serverQueue.playing = false;
        queues.set(message.guildID, serverQueue)
        play(message);
    })
    .on("error", error => console.error(error));
    serverQueue.dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    message.channel.send(`Começando a tocar: **${serverQueue.songs[0].title}**`,{files:[serverQueue.songs[0].thumbnail]});
    console.log(`Começando a tocar: **${serverQueue.songs[0].title}**`);
}

const execute = async (message) => {
    const queueExist = queues.get(message.guildID);
    if(!queueExist) {
        const queueConstructor = {
            connection: null,
            songs: [],
            volume: 5,
            playing: false,
            dispatcher: null,
            voiceChannel: null,
            loop: false
        };
        queues.set(message.guildID, queueConstructor);
    }
    const messageTreated = message.content.substr(6);
    const newQueue = queues.get(message.guildID);
    if(messageTreated.startsWith("http")) {
        if(messageTreated.includes("playlist")) {
            const playlistSearched = await ytPlaylist(messageTreated);
            playlistSearched.items.forEach(element => {
                newQueue.songs.push({url: element.url, title: element.title, thumbnail: element.thumbnails[0].url});
            });
        }
        else {
            const title = await ytdl.getInfo(messageTreated);
            newQueue.songs.push({url:messageTreated, title: title.videoDetails.title, thumbnail: title.videoDetails.thumbnails[0].url});
        }
    }
    else {
        try {
            const ytSearchSong = await ytSearch(messageTreated);
            newQueue.songs.push({url:ytSearchSong.videos[0].url, title:ytSearchSong.videos[0].title, thumbnail: ytSearchSong.videos[0].thumbnail});
        } catch (error) {
            message.channel.send("Musica não encontrada. Tente Novamente");
        }
    }
    newQueue.voiceChannel = message.member.voice.channel;
    newQueue.connection = await newQueue.voiceChannel.join();
    queues.set(message.guildID, newQueue);
    message.channel.send("Música(s) adicionada(s) à fila");
    if(!newQueue.playing) {
        play(message);
    }
}

const skip = (message) => {
    const skipQueue = queues.get(message.guildID);
    if(skipQueue && skipQueue.playing) {
        skipQueue.dispatcher.end();
    }
    else {
        message.channel.send("Não há nenuma música para pular");
    }
}

const stop = (message) => {
    const stopQueue = queues.get(message.guildID);
    if(stopQueue && stopQueue.playing) {
        stopQueue.dispatcher.destroy();
        stopQueue.connection.disconnect();
        queues.delete(message.guildID);
    }
    else {
        message.channel.send("Não há nenuma música tocando no momento");
    }
}

const lista = (message) => {
    const songListFinder = queues.get(message.guildID);
    if(songListFinder.songs[0]) {
        songListFinder.songs.forEach((element,index) => {
            const songName = element;
            message.channel.send(`${index+1}. ${songName.title}`);
        })
    }
}

const loop = (message) => {
    const songListLoop = queues.get(message.guildID);

    if(songListLoop && songListLoop.songs[0]) {
        songListLoop.loop = true;
        queues.set(message.guildID, songListLoop);
        message.channel.send("Música colocada em loop");
    }
}
const unloop = (message) => {
    const songListUnloop = queues.get(message.guildID);

    if(songListUnloop && songListUnloop.songs[0]) {
        songListUnloop.loop = false;
        queues.set(message.guildID, songListUnloop);
        message.channel.send("Música tirada de loop")
    }
}

const goto = (message) => {
    const numberTreated = parseInt(message.content.substr(5),10);
    const queueGoto = queues.get(message.guildID);
    if(numberTreated) {
        if(numberTreated >= queueGoto.songs.length || numberTreated < 0) 
        return message.channel.send("Digite um valor de música correspondente à musica na fila");
        let temporary = queueGoto.songs.splice(numberTreated-1, 1);
        queueGoto.songs = temporary.concat(queueGoto.songs);
        queueGoto.dispatcher.destroy();
        queues.set(message.guildID,queueGoto);
        message.channel.send(`Pulado com sucesso`);
        play(message);
        
    }
    else {
        message.channel.send(`O valor digitado não é um número.`)
    }
}

module.exports = (client) => {
    client.on("message", (message)=> {
        if(message.author.bot)return;
        if(!message.content.startsWith(`${prefix}`)) return;
        if(message.content.startsWith(`${prefix}play`) || message.content.startsWith(`${prefix}tocar`)) {
            execute(message);
        };
        if(message.content.startsWith(`${prefix}skip`) || message.content.startsWith(`${prefix}pular`) ||
            message.content.startsWith(`${prefix}next`)) {
            skip(message);
        };
        if(message.content.startsWith(`${prefix}stop`) ||message.content.startsWith( `${prefix}parar`)) {
            stop(message);
        };
        if(message.content.startsWith(`${prefix}list`)) {
            lista(message);
        };
        if(message.content.startsWith(`${prefix}loop`)) {
            loop(message);
        };
        if(message.content.startsWith(`${prefix}unloop`)) {
            unloop(message);
        };
        if(message.content.startsWith(`${prefix}jump `)) {
            goto(message);
        };
    });
};