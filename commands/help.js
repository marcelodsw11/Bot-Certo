const {prefix} = require("../config.json")
module.exports = (message) => {
    message.channel.send("Os comandos do bot são:");
    message.channel.send(`- ${prefix}help`);
    message.channel.send(`- ${prefix}play ou ${prefix}tocar <nome da musica ou link do youtube ou link da playlist do youtube>`);
    message.channel.send(`- ${prefix}skip ou ${prefix}pular`);
    message.channel.send(`- ${prefix}stop ou ${prefix}parar`);
    message.channel.send(`- ${prefix}oi`);
}