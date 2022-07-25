require('dotenv').config();
require("discord-player/smoothVolume");

// const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Player, AudioFilters } = require("discord-player");

const slash = require('./src/util/slash');
const fs = require('node:fs');
const Spotify = require('node-spotify-api');
const { QuickDB } = require("quick.db");
const { Lyrics } = require("@discord-player/extractor");


const lyricsClient = Lyrics.init();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const spotify = new Spotify({
  id: process.env.spotifyID,
  secret: process.env.spotifySecret
});

// AudioFilters.define("fadein", "afade=t=in:s=0:d=15")
//AudioFilters.define("fadeout", "afade=t=out:d=5")

client.player = new Player(client, {leaveOnEmpty: true, spotifyBridge: true, autoSelfDeaf:false });
client.lyrics = lyricsClient;
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

process.on('uncaughtException', function(err) {
  console.log(err);
});

require('./app.js')