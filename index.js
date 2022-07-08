require('dotenv').config();
require("discord-player/smoothVolume");

const { Client, Collection } = require('discord.js');
const { Player } = require("discord-player");

const slash = require('./src/util/slash');
const fs = require('node:fs');
const Spotify = require('node-spotify-api');
const { QuickDB } = require("quick.db");


const client = new Client({ intents: ["GUILDS", "GUILD_VOICE_STATES"] });
const spotify = new Spotify({
  id: process.env.spotifyId,
  secret: process.env.spotifyAccess
});


client.player = new Player(client);
client.commands = new Collection();
client.spotify = spotify;
client.db = new QuickDB();

require('./src/util/player.js')(client);

const events = fs
  .readdirSync('./src/events')
  .filter(file => file.endsWith('.js'))

events.forEach(event => {
  const eventFile = require(`./src/events/${event}`)
  if (eventFile.oneTime) {
    client.once(eventFile.event, (...args) => eventFile.run(...args))
  } else {
    client.on(eventFile.event, (...args) => eventFile.run(...args))
  }
})

client.login()

module.exports = client;

require('./app.js')