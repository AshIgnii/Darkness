/////Libraries
const Discord = require('discord.js');
const fs = require('fs');
const Danbooru = require('danbooru');
const giphy = require('giphy-api')();
const m3u8stream = require('m3u8stream');
const parseTime = require('m3u8stream/dist/parse-time');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const chalk = require('chalk');
/////


/////Functions
function hook(channel, title, message, color, avatar) {

  if (!channel) return console.log('Channel not specified.');
  if (!title) return console.log('Title not specified.');
  if (!message) return console.log('Message not specified.');
  if (!color) color = 'd9a744';
  if (!avatar) avatar = 'https://cdn4.iconfinder.com/data/icons/technology-devices-1/500/speech-bubble-128.png'
  color = color.replace(/\s/g, '');
  avatar = avatar.replace(/\s/g, '');


  channel.fetchWebhooks()
    .then(webhook => {

      let foundHook = webhook.find(name => webhook.name == 'Webhook');

      if (!foundHook) {
        channel.createWebhook(title, 'https://cdn4.iconfinder.com/data/icons/technology-devices-1/500/speech-bubble-128.png')
          .then(webhook => {

            webhook.send('', {
                "username": title,
                "avatarURL": avatar,
                "embeds": [{
                  "color": parseInt(`0x${color}`),
                  "description": message
                }]
              })
              .catch(error => {
                console.log(error);
                return channel.send('**Algo deu errado, oof!**');
              })
          })
      } else {
        foundHook.send('', {
            "username": title,
            "avatarURL": avatar,
            "embeds": [{
              "color": parseInt(`0x${color}`),
              "description": message
            }]
          })
          .catch(error => {
            console.log(error);
            return channel.send('**Algo deu errado, oof!**');
          })
      }

    })

}

function throwError(reason, origin) {
  let error = new Error;
  error.message = `Comando não executado! Motivo:${reason} Origem:${origin}`
  return error
}
/////

/////Constants
const client = new Discord.Client();
const booru = new Danbooru();
let token;
try {
  token = require('./Configs/settings.json').token;
} catch(e) {
  console.log(chalk.red(`Erro ao retribuir token \n ${e}`))
  return;
}
const version = require('./package.json').version;
const name = require('./package.json').name;
const author = require('./package.json').author;
const functions = null;
const queue = new Map();
const homeServer = 474749720238227458;
/////

/////Configs
const prefix = ">";
var permissão = 'Você não possui permissão para executar este commando!'
/////

client.login(token) //Login

/////Ready Events
client.on('ready', () => {

  /////Console
  let pText = `
      d8b                     d8b
      88P                     ?88
     d88                       88b
 d888888   d888b8b    88bd88b  888  d88'  88bd88b  d8888b .d888b, .d888b,
d8P  ?88  d8P  ?88    88P      888bd8P    88P  ?8bd8b_,dP ?8b,    ?8b,
88b  ,88b 88b  ,88b  d88      d88888b    d88   88P88b        ?8b     ?8b
 ?88P  88b ?88P' 88bd88'     d88'  ?88b,d88'   88b ?888P' ?888P'  ?888P
 `
  console.log(chalk.blueBright(pText))
  console.log('===================================');
  console.log(chalk.green('Estou Online!') + '\n' +
    'Bot:' + name + '\n' +
    'Autor:' + author + '\n' +
    'Versão:' + version + '\n' +
    'Servers:' + client.guilds.cache.array().length); //Cmd Output
  console.log('===================================');
  console.log(chalk.blueBright('Output Log:'));
  /////

  /////Auto-Status
  setTimeout(function() {
    let server = 'servers'
    let status = [`>help`, `Hello World!`, `Online em ${client.guilds.cache.array().length} ${server} :)`, `Darkness ainda é um WIP :)`]
    setInterval(function() {
      let currentstatus = status[Math.floor(Math.random() * status.length)];
      client.user.setPresence({
        game: {
          name: currentstatus
        },
        status: 'online'
      })
    }, 20000)
    client.user.setActivity(`Online em ${client.guilds.cache.array().length} ${server} :)`);
  }, 5000)
  /////
})
/////

//////Guild Events
client.on('guildCreate', guild => {
  console.log(chalk.magenta(`I have Entered ${guild.name} at ${new Date()}`));
});
/////

/////Help command
client.commands = new Discord.Collection();


let rawcmIndex = fs.readFileSync('./commandIndex.json')
let cmIndex = JSON.parse(rawcmIndex);
let cmJsonLen = Object.keys(cmIndex.commands).length
let cmdArray = []

const indexer = require('./command_indexer')
indexer.comindex()

function setCollection(files) {
  let jsfile = files.filter(f => f.split('.').pop() === 'js')
  if (jsfile.length <= 0) {
    return console.log('Commands not found');
  }
  jsfile.forEach((f, i) => {
    let pull = require(`./Commands/${f}`);
    client.commands.set(pull.config.name, pull);
  })
}

for (i = 0; i < cmJsonLen; i++) {
  let cmn = cmIndex.commands[i].file
  cmdArray.push(cmn)
  if (i == cmJsonLen - 1) {
    setCollection(cmdArray)
  }
}
/////

/////Message Event
client.on('message', message => {
  if (message.author.bot) return;
  if (message.mentions.users.find(u => u.id == message.guild.me.id)) {
    if (message.content.toLowerCase().includes('everyone') || message.content.toLowerCase().includes('here')) return;
    message.channel.send(`Meu prefixo é: "${prefix}"`)
      .then(msg => {
        msg.delete(options = {
          timeout: 5000
        })
      })
    return;
  }
  if (message.content.startsWith(prefix + ' ')) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);
  let member = message.member
  let msg = message.content.toUpperCase();
  let author = message.author;
  let args = message.content.slice(prefix.length).trim().split(' ');
  let cmd = args.shift().toLowerCase();
  let ownerid = require('./Configs/PermissionsConfig.json').ownerid;
  let adminsid = require('./Configs/PermissionsConfig.json').adminsid;

  console.log(chalk.bgYellow('Processing Message...'));
  console.log(chalk.yellow(`Message:${message.content}, Guild:${message.guild.name}, Message Channel:${message.channel.name}, Author:${message.author.username}#${message.author.discriminator}, AuthorID:${message.author.id}`));

  let fncm = client.commands.find(name => cmd)
  if (fncm) {
    try {
      let commandFile = require(`./commands/${cmd}.js`)
      commandFile.run(client, message, args, functions, ownerid, adminsid, permissão, author, Discord, hook, booru, prefix, giphy, ytdl, ytsr, queue, serverQueue, throwError);
    } catch (e) {
      if (e.message.startsWith('Comando não executado!')) return;
      if (e.message.includes('Cannot find module')) return console.log(chalk.red('Command does not exists.'));

      console.log(chalk.red(e.message));

      let eGuild = client.guilds.cache.find(hGuild => hGuild.id == homeServer)
      let eChannel = eGuild.channels.cache.find(channel => channel.id == 513418269336666122)

      let embed = new Discord.MessageEmbed()
        .setAuthor('Erro', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png')
        .setColor('RED')
        .setDescription(`Mensagem: ${message.content} \n Autor: ${message.author} \n Server: ${message.guild.name} \n Erro: \n ${e.name + ': ' + e.message}`)
        .setTimestamp(message.createdTimestamp)
      eChannel.send(embed)
    }
  }
})
/////
