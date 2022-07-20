const {SlashCommandBuilder}=require("@discordjs/builders");
const {EmbedBuilder, GuildMember}=require("discord.js");
const {Player, QueryType, QueueRepeatMode}=require("discord-player");


module.exports={
  data: new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Clear the queue!"),
  run: async (interaction) => {
    const player=interaction.client.player;
    const queue=player.getQueue(interaction.guildId);
    if (!queue||!queue.playing) return void interaction.reply({content: "There are no songs playing"});
    const currentTrack=queue.current;
    const success=queue.skip();
    if (!queue.metadata) return;
    queue.metadata.send({
      embeds: [{
        title: `Queue has been cleared by ${ interaction.user.tag }`,
        footer: {
          text: `Requested by ${ currentTrack.requestedBy.tag }`
        },
        color: '000001',
      }],
    });
    queue.tracks=[];
    return void interaction.reply({
      // content: success? `Current song skipped!`:"Something went wrong!",
      embeds: success? [{
        title: `Queue has been cleared by ${ interaction.user.tag }`,
      }]:
        [{
          title: `Something went wrong!`,
        }]
    });
  }
};
