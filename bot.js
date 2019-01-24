const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client();

//Event listener to trigger when bot starts
client.on("ready", () => {
    console.log("Connected and initialized.");
});

client.on("message", (message) => {

});
