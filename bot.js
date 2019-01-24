const Discord = require("discord.js");
const fs = require("fs");

const C = require("constants.js");

const client = new Discord.Client();

let config = JSON.parse(fs.readFileSync("./config.json").toString("utf-8"));

//Event listener to trigger when bot starts
client.on("ready", () => {
    console.log("Connected and initialized.");
});

let connection, dispatcher;
let playState = C.MUSIC_STATES.NO_TRACK;

client.on("message", (message) => {
    if (!message.guild) return;
    let text = message.content;
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
            send("Channel Not Found");
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
            dispatcher = null;
            playState = C.MUSIC_STATES.NO_TRACK;
            send("Stopped.");
        } else {
            send("Nothing is playing.");
        }
    }
});

client.login(config.key).then().catch(console.log);