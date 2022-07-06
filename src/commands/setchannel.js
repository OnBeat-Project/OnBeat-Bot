const {
  SlashCommandBuilder
} = require("@discordjs/builders");
const {
  MessageEmbed,
  GuildMember,
  Permissions
} = require("discord.js");
const {
  Player,
  QueryType,
  QueueRepeatMode
} = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("set")
  .setDescription("Set configurations!")
  .addSubcommand(subcommand => subcommand.setName("channel").setDescription("Set Log Channel!").addChannelOption(option => option.setName('destination').setDescription('Select a channel').setRequired(true))),
  run: async (interaction) => {
    if(!interaction.member.permissions.has([Permissions.FLAGS.MANAGE_CHANNELS])) return interaction.reply({content: "You don't have Manage Channels permission!", ephemeral: true});
    const db = interaction.client.db;
    if (interaction.options.getSubcommand() === 'channel') {
		
     const channel = interaction.options.getChannel('destination');
     // console.log()
     if(channel.type !== "GUILD_TEXT") return interaction.reply({content: "Must be text channel!", ephemeral: true});
     if(!channel.permissionsFor(interaction.guild.me).has([Permissions.FLAGS.VIEW_CHANNEL])) return interaction.reply({content: "I can't see this channel!"});
     if(!channel.permissionsFor(interaction.guild.me).has([Permissions.FLAGS.SEND_MESSAGES])) return interaction.reply({content: "I can't send messages to this channel!"});
     await db.set(`channel_${interaction.guild.id}`, channel.id);
     interaction.reply({content: "✅ | Now the log channel is <#" + channel + ">!"})
    }
  }
}