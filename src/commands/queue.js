const {
  SlashCommandBuilder
} = require("@discordjs/builders");
const {
  EmbedBuilder,
  GuildMember
} = require("discord.js");
const {
  Player,
  QueryType,
  QueueRepeatMode
} = require("discord-player");


module.exports = {
  data: new SlashCommandBuilder()
  .setName("queue")
  .setDescription("Musics in queue!"),
  run: async (interaction) => {
    const player = interaction.client.player;
    const queue = player.getQueue(interaction.guildId);
    if (queue.playing) {
      const currentTrack = queue.current;
      const tracks = queue.tracks.slice(0, 10).map((m, i) => {
        return `${i + 1}. **${m.title}** by ${m.author}`;
      });
      interaction.reply({
        embeds: [{
          title: 'Server Queue',
          description: `${tracks.join('\n')}${
          queue.tracks.length > 10
          ? `\n...${queue.tracks.length - 10} more track(s)`: ''
          }`,
          color: 0xff0000,
          fields: [{
            name: 'Now Playing', value: `🎶 | **${currentTrack.title}** by ${currentTrack.author}`
          }]
        }]
      })
    } else {}
  }
}