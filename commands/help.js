const {prefix} = require("../config.json")
module.exports = (message) => {
    message.channel.send("Bom Diaaa! Os comandos do bot são:");
    message.channel.send(`- ${prefix}help`);
    message.channel.send(`- ${prefix}play ou ${prefix}tocar <nome da musica ou link do youtube ou link da playlist do youtube>`);
    message.channel.send(`- ${prefix}skip ou ${prefix}pular ou ${prefix}next`);
    message.channel.send(`- ${prefix}stop ou ${prefix}parar`);
    message.channel.send(`- ${prefix}list ou ${prefix}lista`);
    message.channel.send(`- ${prefix}jump <número da música na lista>`);
    message.channel.send(`- ${prefix}loop`);
    message.channel.send(`- ${prefix}unloop`);
    message.channel.send(`- ${prefix}roi`);
}