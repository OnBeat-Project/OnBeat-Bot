const {SlashCommandBuilder}=require("@discordjs/builders");
const {EmbedBuilder, GuildMember}=require("discord.js");
const {Player, QueryType, QueueRepeatMode}=require("discord-player");


module.exports={
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Volume of music!")
    .addStringOption(o => o.setName("vol").setDescription("From 0 to 100").setRequired(false)),
  run: async (interaction) => {
    const player=interaction.client.player;
    // await interaction.deferReply();
    const queue=player.getQueue(interaction.guildId);
    if (!queue||!queue.playing) return void interaction.reply({
      embeds: [{
        title: `There is nothing playing.`,
        color: '000001',
      }]
    });
    const vol=interaction.options.get("vol");
    if (!vol) return void interaction.reply({
      embeds: [{
        title: `Volume is set at ${ queue.volume }.`,
        color: '000001',
      }]
    });
    if ((vol.value)<0||(vol.value)>100) return void interaction.reply({content: "Volume must be 0-100"});
    const success=queue.setVolume(vol.value);
    return void interaction.reply({
      // content: success? `✅ | Volume set to **${ vol.value }%**!`:"❌ | Something went wrong!",
      embeds: success? [{
        title: `Volume set to **${ vol.value }** by ${ interaction.user.tag }`,
      }]:
        [{
          title: `Something went wrong!`,
        }]

    });
  }
};
