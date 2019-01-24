const Discord = require("discord.js");
const fs = require("fs");

const C = require("./constants.js");

const client = new Discord.Client();

let config = JSON.parse(fs.readFileSync("./config.json").toString("utf-8"));

//Event listener to trigger when bot starts
client.on("ready", () => {
    console.log("Connected and initialized.");
});

let connection, dispatcher;
let playState = C.MUSIC_STATES.NO_TRACK;

//TODO permissions

function getSpecificVChannel(guild, name) {
    let allChannels = guild.channels.array();
    let target;
    for (let ch of allChannels) {
        if (ch.type === "voice" && ch.name === name) {
            target = ch;
            break;
        }
    }
    return target;
}

function getPeopleWithNames(guild, names) {
    let allChannels = guild.channels.array();
    let people = []; //all people in voice channels
    for (let ch of allChannels) {
        if (ch.type === "voice") {
            for (let mem of ch.members.array()) {
                people.push(mem);
            }
        }
    }
    let ret = [];
    for (let p of people) {
        for (let n of names) {
            //O(n^2) baby
            if (p.nickname === n || p.user.username === n) {
                ret.push(p);
                break;
            }
        }
    }
    return ret;
}

client.on("message", (message) => {
    if (!message.guild) return;
    let text = message.content.toLowerCase();
    let loc = message.channel;
    const send = (text) => {
        message.channel.send(text).then();
    };
    if (text === "join") {
        if (message.member.voiceChannel && !connection) {
            message.member.voiceChannel.join().then((c) => {
                connection = c;
            }).catch(console.log);
        } else {
            if (connection) {
                send("Connection Occupied.");
            } else {
                send("Channel Not Found.");
            }
        }
    }
    if (text === "leave") {
        if (connection) {
            connection.disconnect();
            connection = null;
            dispatcher = null;
        } else {
            send("No connection found to leave.");
        }
    }
    if (text.substring(0, "play ".length) === "play ") {
        let file = "./sounds/" + text.substring("play ".length);
        if (!connection) {
            send("No Current Connection, I need to be in a voice channel.");
            return;
        }
        if (fs.existsSync(file)) {
            if (dispatcher) {
                send("Something is playing already.");
            } else {
                dispatcher = connection.playFile(file);
                playState = C.MUSIC_STATES.PLAYING;
                dispatcher.on("end", () => {
                    dispatcher = null;
                    playState = C.MUSIC_STATES.NO_TRACK;
                });
            }
        } else {
            send("File Not Found.");
        }
    }
    if (text === "pause") {
        switch (playState) {
            case C.MUSIC_STATES.NO_TRACK:
                send("Nothing is playing.");
                break;
            case C.MUSIC_STATES.PLAYING:
                dispatcher.pause();
                send("Paused.");
                playState = C.MUSIC_STATES.PAUSED;
                break;
            case C.MUSIC_STATES.PAUSED:
                dispatcher.resume();
                send("Unpaused.");
                playState = C.MUSIC_STATES.PLAYING;
                break;
        }
    }
    if (text === "stop") {
        if (dispatcher) {
            dispatcher.end();
            send("Stopped.");
        } else {
            send("Nothing is playing.");
        }
    }
    if (text.substring(0, "moveme ".length) === "moveme ") {
        let destination = message.content.substring("moveme ".length);
        let target = getSpecificVChannel(message.guild, destination);
        if (target) {
            message.member.setVoiceChannel(target.id).then().catch(console.log);
        } else {
            send("Channel not found.");
            return;
        }
    }
    if (text.substring(0, "moveus ".length) === "moveus ") {
        let destination = message.content.match(/moveus ([a-zA-Z ]+) \([a-zA-Z, ]+\)/);
        if (!destination) return;
        destination = destination[1]; //get the RegExp match
        let target = getSpecificVChannel(message.guild, destination);
        let toJump = getPeopleWithNames(message.guild, ["Bairac", "Audiomage", "Stef"]);
        if (!target) {
            send("Channel not found.");
            return;
        }
        for (let p of toJump) {
            p.setVoiceChannel(target.id).then().catch(console.log);
        }
    }
});

client.login(config.key).then().catch(console.log);