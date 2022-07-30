const {
  SlashCommandBuilder
}=require("@discordjs/builders");
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
    .setName("queue")
    .setDescription("Musics in queue!"),
  run: async (interaction) => {
    const test=await interaction.client.player.getQueue(interaction.guild.id);

    interaction.reply({
      embeds: [{
        title: "Queue",
        description: `${ test }`
      }]
    });
  }
};