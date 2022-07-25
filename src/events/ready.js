const ora = require("ora");
const config = require("../..//config");
const fs = require("node:fs");

const slash = require("../util/slash");

const botLoader = ora("Starting Discord.js Client").start();

module.exports = {
  event: "ready",
  oneTime: false,
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


    // Status lmao
    function Status() {
      let usersCount = 0;

      client.guilds.cache.forEach((g) =>
        {
          usersCount += g.memberCount;
        });
      const statusArray = [{
        name: "Prefix: /",
        type: "LISTENING"
      },
        {
          name: "Despacito: Most listened to so far on OnBeat...",
          type: "WATCHING"
        },
        {
          name: `${client.guilds.cache.size} guilds and ${usersCount} users`,
          type: "WATCHING"
        },
        {
          name: "ROBLOX",
          type: "PLAYING"
        },
        {
          name: "Our github//OnBeat-Project",
          type: "STREAMING",
          url: "https://twitch.tv/settings"
        }]
      const statusRandom = statusArray[Math.floor(Math.random() * statusArray.length)];
      // client.user.setActivity(,);
      console.log("Status changed to\n"+statusRandom.name)
    }
    client.user.setAFK(false)
    /*client.user.setPresence({
      status: "idle",
      activities: [{ name: "Despacito: most listened on OnBeat", type: "LISTENING"}]
    })*/
    // Status()
    // setInterval(Status, 20000);
  },
};