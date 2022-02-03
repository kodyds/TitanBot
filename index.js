const Discord = require('discord.js');
const client = new Discord.Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS']
});
const token = 'OTM4Nzc5MDU0NzkyOTI1MjU0.YfvQIA.z_FdcRcMKDEsPW5fIVrYcqUaYU4';
const badWordsString='操你媽 你媽死了 你媽炸了 你媽飛了 你媽活了 你媽文藝了';
const badWordsArray=badWordsString.split(' ');
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
client.on('ready', ()=>console.log('started'));
client.on('messageCreate', message => {
  console.log(message.content);
    if (message.content!==null && badWordsString.includes(message.content) != true) {
      message.channel.send(badWordsArray[getRandomInt(badWordsArray.length)]);
    }
    if (message.content.startsWith("滾吧 ")) {
      if (message.mentions.members.first()) {
          message.mentions.members.first().kick().then((member) => {
              message.channel.send(":wave: " + member.displayName + " has been successfully kicked :point_right: ");
          }).catch(() => {
              message.channel.send("I do not have permissions to do this");
          });
      }
  }
  else if (message.content.startsWith("我不想再見到 ")) {
      if (message.mentions.members.first()) {
          message.mentions.members.first().ban().then((member) => {
              message.channel.send(":wave: " + member.displayName + " has been successfully banned :point_right: ");
          }).catch(() => {
              message.channel.send("I do not have permissions to do this");
          });
      }
  }
  });
client.login(token);