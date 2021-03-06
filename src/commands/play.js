const {
  SlashCommandBuilder
}=require("@discordjs/builders");
/*const {
  Embed,
  GuildMember
} = require("discord.js");*/
const {
  EmbedBuilder,
  GuildMember
}=require("discord.js");
const {
  Player,
  QueryType,
  QueueRepeatMode
}=require("discord-player");


module.exports={
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Request a song!")
    .addStringOption(o => o.setName("query").setDescription("Song to be requested").setRequired(true)),
  run: async (interaction) => {
    const channeldb=await interaction.client.db.get(`channel_${ interaction.guild.id }`);
    // if(!channeldb) return interaction.reply({content: `Please, use \`/set channel\` to set a log channel.`});
    if (!interaction.guild.channels.cache.get(channeldb)) {
      await interaction.client.db.delete(`channel_${ interaction.guild.id }`);
      // return interaction.reply("The log channel don't exists anymore.")
    }
    // await interaction.deferReply();
    const player=interaction.client.player;
    if (!(interaction.member instanceof GuildMember)||!interaction.member.voice.channel) {
      return void interaction.reply({
        content: "You are not in a voice channel!", ephemeral: true
      });
    }

    if (interaction.guild.members.me.voice.channelId&&interaction.member.voice.channelId!==interaction.guild.members.me.voice.channelId) {
      return void interaction.reply({
        content: "You are not in my voice channel!", ephemeral: true
      });
    }
    const query=interaction.options.get("query").value;
    var track;
    try {
      track=await interaction.client.spotify.search({type: 'track', query: query});
    } catch (e) {
      track={
        tracks: {
          items: []
        }
      };
    }
    // console.log()
    console.log(track.tracks.items[0]? track.tracks.items[0].external_urls.spotify:query);
    const searchResult=await player
      .search(track.tracks.items[0]? track.tracks.items[0].external_urls.spotify:query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.SPOTIFY_SONG
      })
      .catch(() => {});
    if (!searchResult||!searchResult.tracks.length) return void interaction.reply({
      content: "No results were found. \nTry using the artist name (e.g. Saturday - Norma Jean Wright) or use a Spotify URL!"
    });
    console.log(channeldb);
    const queue=await player.createQueue(interaction.guild, {
      metadata: interaction.guild.channels.cache.get(channeldb),
      i: interaction
    });

    try {
      if (!queue.connection) await queue.connect(interaction.member.voice.channel);
    } catch {
      void player.deleteQueue(interaction.guildId);
      return void interaction.reply({
        embeds: [{
          title: "I can't join your Voice Channel!",
        }]
      });
    }
    queue.setVolume(75);
    // await interaction.deferReply({ephemeral:true});
    void interaction.reply({
      embeds: [{
        title: "Song added to queue!",
        description: `**${ searchResult.tracks[0].title }** by **${ searchResult.tracks[0].author }**`,
        fields: [{
          name: "You can manage the bot from our website below!",
          value: "[Click here!](https://onbeat.me/dashboard 'OnBeat Website')",
          inline: true
        }]
      }],
      ephemeral: true
    });
    searchResult.playlist? queue.addTracks(searchResult.tracks):queue.addTrack(searchResult.tracks[0]);
    if (!queue.playing) await queue.play();
  }
};
