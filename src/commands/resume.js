const {SlashCommandBuilder}=require("@discordjs/builders");
const {EmbedBuilder, GuildMember}=require("discord.js");
const {Player, QueryType, QueueRepeatMode}=require("discord-player");


module.exports={
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume current song!"),
  run: async (interaction) => {
    const player=interaction.client.player;
    const queue=player.getQueue(interaction.guildId);
    if (!queue||!queue.playing) return void interaction.reply({
      embeds: [{
        title: `There is nothing playing.`,
        color: '000001',
      }]
    });
    const currentTrack=queue.current;
    const success=queue.setPaused(false);
    return void interaction.reply({
      // content: success? `Current song resumed!`:"Something went wrong!",
      embeds: success? [{
        title: `Current song resumed by ${ interaction.user.tag }`,
      }]:
        [{
          title: `Something went wrong!`,
        }]

    });
  }
};
