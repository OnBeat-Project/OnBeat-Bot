const {
  SlashCommandBuilder
} = require("@discordjs/builders");
const {
  MessageEmbed
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("ping")
  .setDescription("pong!"),
  run: async (interaction) => {
    const embed = new MessageEmbed()
    .setTitle("Getting ping...")
    .setDescription("Wait a second...\nAPI Ping: " + interaction.client.ws.ping + " ms")
    .setColor("RANDOM");
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