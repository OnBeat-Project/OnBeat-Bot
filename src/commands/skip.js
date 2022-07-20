const {SlashCommandBuilder}=require("@discordjs/builders");
const {EmbedBuilder, GuildMember}=require("discord.js");
const {Player, QueryType, QueueRepeatMode}=require("discord-player");


module.exports={
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip current song!"),
  run: async (interaction) => {
    const player=interaction.client.player;
    const queue=player.getQueue(interaction.guildId);
    if (!queue||!queue.playing) return void interaction.reply({content: "There are no songs playing"});
    const currentTrack=queue.current;
    const success=queue.skip();
    if (!queue.metadata) return;
    queue.metadata.send({
      // content: `🎶 | Track **${ currentTrack.title }** has been skipped!\n🙆 | Skipped by ${ interaction.user.tag }`,
      embeds: [{
        title: `Track **${ currentTrack.title }** has been skipped!`,
        footer: {
          text: `Requested by ${ currentTrack.requestedBy.tag }`
        },
        color: '000001',
      }],
    });
    return void interaction.reply({
      // content: success? `Current song skipped!`:"Something went wrong!",
      embeds: success? [{
        title: `Current song skipped by ${ interaction.user.tag }`,
      }]:
        [{
          title: `Something went wrong!`,
        }]

    });
  }
};
