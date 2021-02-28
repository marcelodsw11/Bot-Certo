const {prefix} = require("../config.json")
const messages = (message) => {
    message.channel.send("Bom Diaaa! Os comandos do bot são:");
    message.channel.send(`- ${prefix}help`);
    message.channel.send(`- ${prefix}play ou ${prefix}tocar ou ${prefix}p <nome da musica ou link do youtube ou link da playlist do youtube>`);
    message.channel.send(`- ${prefix}skip ou ${prefix}pular ou ${prefix}next`);
    message.channel.send(`- ${prefix}stop ou ${prefix}parar`);
    message.channel.send(`- ${prefix}list ou ${prefix}lista`);
    message.channel.send(`- ${prefix}jump <número da música na lista>`);
    message.channel.send(`- ${prefix}loop`);
    message.channel.send(`- ${prefix}unloop`);
    message.channel.send(`- ${prefix}roi`);
}
module.exports = (client) => {
    client.on("message",async (message) => {
        if(message.author.bot) return;
        else if(!message.content.startsWith(prefix)) return;
        else if(message.content.startsWith(`${prefix}help`)) {
            messages(message);
            return;
        }
        else if(message.content.startsWith(`${prefix}roi`)) {
            await message.channel.send(``,
                {files: ["https://cdn.discordapp.com/attachments/812141208155193344/814670077902716968/roi.gif"]});
                message.channel.send(`Roi ${message.author.username} né.`);
            message.channel.send(`Eu sou o bot do canal Life™, se quiser ver os comandos digite: ${prefix}help`);
        }
    })
}