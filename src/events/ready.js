const ora = require("ora");
const config = require("../..//config");
const fs = require("node:fs");

const slash = require("../util/slash");

const botLoader = ora("Starting Discord.js Client").start();

module.exports = {
  event: "ready",
  oneTime: true,
  run: async (client) => {
    const commandFiles = fs
      .readdirSync("./src/commands")
      .filter((file) => file.endsWith(".js"));

    let commandsArray = [];
    commandFiles.forEach((file) => {
      const command = require(`../commands/${file}`);
      client.commands.set(command.data.name, command);

      commandsArray.push(command);
    });

    const finalArray = commandsArray.map((e) => e.data.toJSON());
    slash.register(client.user.id, finalArray);
    botLoader.succeed(`${client.user.tag} Started`);
  },
};