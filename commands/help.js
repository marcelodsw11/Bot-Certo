const {prefix} = require("../config.json")
module.exports = (message) => {
    message.channel.send("Os comandos do bot são:");
    message.channel.send(`- ${prefix}help`);
    message.channel.send(`- ${prefix}p <nome da musica ou link do youtube ou link da playlist do youtube>`);
    message.channel.send(`- ${prefix}next`);
    message.channel.send(`- ${prefix}stop`);
    message.channel.send(`- ${prefix}oi`);
}