const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client();

let config = JSON.parse(fs.readFileSync("./config.json").toString("utf-8"));

//Event listener to trigger when bot starts
client.on("ready", () => {
    console.log("Connected and initialized.");
});

let connection, dispatcher;

client.on("message", (message) => {
    if (!message.guild) return;
    let text = message.content;
    if (text === "join") {
        if (message.member.voiceChannel && !connection) {
            message.member.voiceChannel.join().then((c) => {
                connection = c;
            }).catch(console.log);
        } else {
            if (connection) {
                message.channel.send("Connection Occupied.").then();
            } else {
                message.channel.send("Channel Not Found.").then();
            }
        }
    }
    if (text === "leave") {
        if (connection) {
            connection.disconnect();
            connection = null;
            dispatcher = null;
        } else {
            message.channel.send("Channel Not Found").then();
        }
    }
    if (text.substring(0, "play ".length) === "play ") {
        let file = "./sounds/" + text.substring("play ".length);
        if (!connection) {
            message.channel.send("No Current Connection, I need to be in a voice channel.").then();
            return;
        }
        if (fs.existsSync(file)) {
            if (dispatcher) {
                message.channel.send("Something is playing already.").then();
            } else {
                dispatcher = connection.playFile(file);
                dispatcher.on("end", () => {
                    dispatcher = null;
                });
            }
        } else {
            message.channel.send("File Not Found.").then();
        }

    }
});

client.login(config.key).then().catch(console.log);