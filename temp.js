const Discord = require('discord.js');
const ytdl = require("ytdl-core");
const queue = new Map();
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS']
});
const prefix = '-'
const token = 'OTM4Nzc5MDU0NzkyOTI1MjU0.YfvQIA.xUGORwRG9gLjJY_cBkCIviq_57Q';
const badWordsString = '操你媽 你媽死了 你媽炸了 你媽飛了 你媽活了 你媽文藝了 我是你媽';
const badWordsArray = badWordsString.split(' ');
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
client.on('ready', () => console.log('started'));
client.on('message', async message => {
    console.log(message.content);
    if (message.content !== null && message.author.bot != true) {
        message.channel.send(badWordsArray[getRandomInt(badWordsArray.length)]).catch((err) => console.log(err));
    }
    if (message.content.startsWith("滾吧 ")) {
        if (message.mentions.members.first()) {
            message.mentions.members.first().kick().then((member) => {
                message.channel.send(":wave: " + member.displayName + " has been successfully kicked :point_right: ").catch((err) => { console.log(err) });
            }).catch(() => {
                message.channel.send("I do not have permissions to do this").catch((err) => { console.log(err) });
            });
        }
    }
    else if (message.content.startsWith("我不想再見到 ")) {
        if (message.mentions.members.first()) {
            message.mentions.members.first().ban().then((member) => {
                message.channel.send(":wave: " + member.displayName + " has been successfully banned :point_right: ").catch((err) => { console.log(err) });
            }).catch(() => {
                message.channel.send("I do not have permissions to do this").catch((err) => { console.log(err) });
            });
        }
    }
    if (message.content.startsWith("辛曉晴")) {
        let voiceChannel = message.member.voice.channel;
        voiceChannel.join().then(connection => {
            const dispatcher = connection.play('teddy.mp3');
            dispatcher.on("end", end => { voiceChannel.leave();});
        }).catch(err => console.log(err));
    }
    if (message.content.startsWith(prefix)) {
        const serverQueue = queue.get(message.guild.id);
        if (message.content.startsWith(`${prefix}play`)) {
            execute(message, serverQueue);
            return;
        } else if (message.content.startsWith(`${prefix}skip`)) {
            skip(message, serverQueue);
            return;
        } else if (message.content.startsWith(`${prefix}stop`)) {
            stop(message, serverQueue);
            return;
        } else {
            message.channel.send("You need to enter a valid command!").catch((err) => { console.log(err) });
        }
    };
});
async function execute(message, serverQueue) {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "You need to be in a voice channel to play music!"
        ).catch((err) => { console.log(err) });
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        ).catch((err) => { console.log(err) });
    }

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };
    voiceChannel.join();
    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    if (!serverQueue)
        return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        ).catch((err) => { console.log(err) });

    if (!serverQueue)
        return message.channel.send("There is no song that I could stop!").catch((err) => { console.log(err) });

    serverQueue.songs = [];
    try {
        serverQueue.connection.dispatcher.end();
    }
    catch (err) {
        console.log(err);
    }

}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

client.login(token);