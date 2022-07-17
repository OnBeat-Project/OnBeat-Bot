const {
  SlashCommandBuilder
} = require("@discordjs/builders");
/*const {
  EmbedBuilder
} = require("discord.js");
*/
const {
  MessageEmbed,
  GuildMember
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("ping")
  .setDescription("pong!"),
  run: async (interaction) => {
    const embed = new MessageEmbed()
    .setTitle("Getting ping...")
    .setDescription("Wait a second...\nAPI Ping: " + interaction.client.ws.ping + " ms")
    .setColor("BLURPLE");
    interaction.reply({
      embeds: [embed], fetchReply: true
    }).then(m => {
      //console.log(m)
      embed.setTitle("Pong!")
      .setDescription(`${Date.now() - m.createdTimestamp} ms\nAPI Ping: ${interaction.client.ws.ping} ms`);
      interaction.editReply({
        embeds: [embed]})
    });
  }
}