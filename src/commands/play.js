const {
  SlashCommandBuilder
} = require("@discordjs/builders");
const {
  MessageEmbed,
  GuildMember
} = require("discord.js");
const {
  Player,
  QueryType,
  QueueRepeatMode
} = require("discord-player");


module.exports = {
  data: new SlashCommandBuilder()
  .setName("play")
  .setDescription("Request a music!")
  .addStringOption(o => o.setName("query").setDescription("Music to be requested").setRequired(true)),
  run: async (interaction) => {

    const player = interaction.client.player;
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
      return void interaction.reply({
        content: "You are not in a voice channel!", ephemeral: true
      });
    }

    if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) {
      return void interaction.reply({
        content: "You are not in my voice channel!", ephemeral: true
      });
    }
    const query = interaction.options.get("query").value;
    const track = await interaction.client.spotify.search({ type: 'track', query: query});
     // console.log()
    const searchResult = await player
    .search(track.tracks.items[0]?track.tracks.items[0].external_urls.spotify:query, {
      requestedBy: interaction.user,
      searchEngine: QueryType.SPOTIFY_SONG
    })
    .catch(() => {});
    if (!searchResult || !searchResult.tracks.length) return void interaction.reply({
      content: "No results were found, try put artist name (e.g. Saturday - Norma Jean Wright) or try put Spotify Link URL!"
    });

    const queue = await player.createQueue(interaction.guild, {
      metadata: interaction.channel
    });

    try {
      if (!queue.connection) await queue.connect(interaction.member.voice.channel);
    } catch {
      void player.deleteQueue(interaction.guildId);
      return void interaction.reply({
        content: "I can't join in your Voice Channel!"
      });
    }

    await interaction.reply({
      content: `Wait...`
    });
    searchResult.playlist ? queue.addTracks(searchResult.tracks): queue.addTrack(searchResult.tracks[0]);
    if (!queue.playing) await queue.play();
  }
}