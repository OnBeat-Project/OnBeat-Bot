const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, GuildMember } = require("discord.js");
const { Player, QueryType, QueueRepeatMode } = require("discord-player");


module.exports = {
  data: new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Skip current song and clear the queue!"),
  run: async (interaction) => {
    const player = interaction.client.player
    const queue = player.getQueue(interaction.guildId);
        if (!queue || !queue.playing) return void interaction.reply({ content: "There are no songs playing" });
        const currentTrack = queue.current;
        const success = queue.skip();
        if(!queue.metadata) return;
       queue.metadata.send({
       content: `🎶 | The queue has been cleared!\n🙆 | Cleared by ${interaction.user.tag}`,
       })
    queue.tracks = []
        return void interaction.reply({
            content: success ? `Current song skipped!` : "Something went wrong!"
        });
  }
}
