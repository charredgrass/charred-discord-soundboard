const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client();

let config = JSON.parse(fs.readFileSync("./config.json").toString("utf-8"));

//Event listener to trigger when bot starts
client.on("ready", () => {
    console.log("Connected and initialized.");
});

client.on("message", (message) => {
    if (!message.guild) return;
    let text = message.content;
    if (text === "join") {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join().then((connection) => {

            }).catch(console.log);
        } else {
            message.channel.send("Channel Not Found.").then();
        }
    }
    if (text === "leave") {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.leave();
        } else {
            message.channel.send("Channel Not Found").then();
        }
    }
    if (text.substring(0, "play".length) === "play") {
        let file = "./sounds/" + text.substring("play".length);
        if (fs.existsSync(file)) {

        }

    }
});

client.login(config.key).then().catch(console.log);