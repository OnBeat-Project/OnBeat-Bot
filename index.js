const {
  Client, Collection, Intents, MessageEmbed,
}=require('discord.js');
const {REST}=require("@discordjs/rest");
const {Routes}=require("discord-api-types/v9");
const fs=require('fs');
require('dotenv').config();
const chalk=require("chalk");
const {Player}=require("discord-player");
require("discord-player/smoothVolume");
require("@discord-player/extractor")
const playdl=require("play-dl");

/*intents.add(
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_VOICE_STATES
);*/
const client=new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES], partials: ['MESSAGE', 'REACTION'], allowedMentions: {parse: ['users']}});


const player=new Player(client);

player.on("trackStart", (queue, track) => queue.metadata.channel?queue.metadata.channel.send({
  embeds: [{
    title: `Now playing:`,
    fields: [{
      name: "Song",
      value: `${ track.title }`,
      inline: true,
    }, {
      name: "Artist",
      value: `${ track.author }`,
      inline: false,
    }, {
      name: "Requested by",
      value: `${ track.requestedBy }`,
      inline: false
    }],
    color: 0x00ff00,
    thumbnail: {
      url: track.thumbnail,
    },
    footer: {
      text: `Duration: ${ track.duration } | Views: ${ track.views }`,
    },
  }],
}):"");
player.on("trackAdd", (queue, track) => queue.metadata.channel?queue.metadata.channel.send({
  embeds: [{
    title: `Added to queue:`,
    fields: [{
      name: "Song",
      value: `${ track.title }`,
      inline: true,
    }, {
      name: "Artist",
      value: `${ track.author }`,
      inline: false,
    }, {
      name: "Requested by",
      value: `${ track.requestedBy }`,
      inline: false
    }],
    color: 0x00ff00,
    thumbnail: {
      url: track.thumbnail,
    },
    footer: {
      text: `Duration: ${ track.duration } | Views: ${ track.views }`,
    },
  }],
}):"");
client.slash=new Collection();
client.player = player;

const cmds=fs.readdirSync('./src/cmds').filter((file) => file.endsWith('.js'));
const commands=[];
for (const file of cmds) {
  const command=require(`./src/cmds/${ file }`);
  commands.push(command.data.toJSON());
  client.slash.set(command.data.name, command);
}

const rest=new REST({version: "9"}).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application [/] commands.");

    await rest.put(
      Routes.applicationCommands("930117271802773514"),
      {body: commands},
    );

    console.log("Successfully reloaded application [/] commands.");
  } catch (error) {
    console.error(error);
  }
})();

/*const events = fs
  .readdirSync('./src/events')
  .filter(file => file.endsWith('.js'))

events.forEach(event => {
  const eventFile = require(`./src/events/${event}`)
  if (eventFile.oneTime) {
    client.once(eventFile.event, (...args) => eventFile.run(...args))
  } else {
    if(eventFile.player) {
      client.player.on(eventFile.event, (...args) => eventFile.run(...args));
    } else {
    client.on(eventFile.event, (...args) => eventFile.run(...args))
    }
  }
})*/

client.once('ready', async () => {
  for (const file of cmds) {
    console.log(`${ chalk.yellowBright('[SLASH COMMAND LOADED]') } ${ file }`);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command=client.slash.get(interaction.commandName);

  if (!command) return;
  console.log(`${ chalk.yellowBright('[EVENT FIRED]') } interactionCreate with command ${ interaction.commandName }`);
  try {
    await command.execute(interaction, client, player);
  } catch (error) {
    console.error(error);
    interaction.reply({content: `${ error }`, ephemeral: true});
  }
});
client.login(process.env.TOKEN);

module.exports = client;

require('./app');
