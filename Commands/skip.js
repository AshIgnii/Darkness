exports.run = (client, message, args, functions, ownerid, adminsid, permissão, author, Discord, hook, booru, prefix, giphy, ytdl, ytsr, queue, serverQueue, throwError) => {
  let clientchannel = message.guild.me.voice.channelID
  let userchannel = message.member.voice.channelID
  let members = null
  let membernum = null
  if (clientchannel) {
    members = message.member.guild.me.voice.channel.members.array()
    membernum = members.length
  }

  if (clientchannel == undefined) {
    let m = message.channel.send('Eu não estou conectada a nenhum canal de voz!')
    .then(msg => {msg.delete(options = {timeout: 5000})})
    throw throwError('Client not in channel', 'skip');
    return;
  }
  if (userchannel != clientchannel) {
    let m = message.channel.send('Você precisa estar presente no canal de voz para usar este commando!')
    .then(msg => {msg.delete(options = {timeout: 5000})})
    throw throwError('User not in channel', 'skip');
    return;
  }
  if (!serverQueue.songs) {
    let m = message.channel.send("Eu não estou tocando nenhuma musica!")
    .then(msg => {msg.delete(options = {timeout: 5000})})
    throw throwError('No songs in queue', 'skip');
    return;
  }
  if (membernum < 2) {
    if (message.member.roles.cache.find(role => role.name.toLowerCase() == 'dj')) {} else {
      let m = message.channel.send('Você precisa ter permissão de DJ ou estar sozinho no canal de voz para parar musicas')
      .then(msg => {msg.delete(options = {timeout: 5000})})
      throw throwError('Missing permission', 'skip');
      return;
    }
  }

  serverQueue.connection.dispatcher.end();
  message.channel.send('⏩**Musica pulada!**')
  console.log('\x1b[32m%s\x1b[0m', 'Executed: True');
}

module.exports.config = {
  name: 'skip',
  description: 'pula a musica que está tocando',
  adminOnly: 'Não',
  ownerOnly: 'Não'
}
