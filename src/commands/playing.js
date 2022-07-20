const {SlashCommandBuilder}=require("@discordjs/builders");
const {EmbedBuilder, GuildMember}=require("discord.js");
const {Player, QueryType, QueueRepeatMode}=require("discord-player");


module.exports={
  data: new SlashCommandBuilder()
    .setName("playing")
    .setDescription("Current playing song!"),
  run: async (interaction) => {
    const player=interaction.client.player;
    const queue=player.getQueue(interaction.guildId);
    if (queue.playing) {
      interaction.reply({
        embeds: [{
          title: `Now playing: ${ queue.current.title } by ${ queue.current.author }`,
          footer: {
            text: `Requested by ${ queue.current.requestedBy.tag }`
          },
          color: 'RANDOM',
        }]
      });
    } else {
      interaction.reply({
        embeds: [{
          title: `Nothing is playing.`,
          color: 'RANDOM',
        }]
      });
    }
  }
};
