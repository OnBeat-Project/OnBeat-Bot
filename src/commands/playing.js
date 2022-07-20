const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, GuildMember } = require("discord.js");
const { Player, QueryType, QueueRepeatMode } = require("discord-player");


module.exports = {
  data: new SlashCommandBuilder()
  .setName("playing")
  .setDescription("Current playing song!"),
  run: async (interaction) => {
    const player = interaction.client.player
    const queue = player.getQueue(interaction.guildId);
    if(!queue || !queue.playing){
  interaction.reply("Nothing is currently playing!")
    }else{
interaction.reply(`The song playing is ${queue.current.title} by ${queue.current.author}`)
    }
  }
}