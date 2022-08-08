const {SlashCommandBuilder}=require('@discordjs/builders');
const {
    MessageEmbed, Modal, MessageActionRow, TextInputComponent, MessageButton,
}=require('discord.js');
const chalk=require('chalk');

module.exports={
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip a song!'),
    async execute(interaction, client, player) {

        if (!interaction.member.voice.channelId) return await interaction.reply({
            embeds: [{
                title: "You are not in a voice channel!",
                color: 0xFF0000
            }],
            ephemeral: true
        });
        if (interaction.guild.me.voice.channelId&&interaction.member.voice.channelId!==interaction.guild.me.voice.channelId) return await interaction.reply({
            embeds: [{
                title: "You are not in my voice channel!",
                color: 0xFF0000
            }],
            ephemeral: true
        });

        let q=player.getQueue(`${ interaction.guild.id }`);
        if (!q||q===undefined||q.length===0) return await interaction.reply({
            embeds: [{
                title: "Nothing is playing!",
                color: 0x00ff00,
            }],
            ephemeral: true
        });

        interaction.reply({
            embeds: [{
                title: `Skipped: **${ q.current.title }** by **${ q.current.author }**`,
                color: 0x00ff00,
            }],
            ephemeral: true
        }).catch(e => interaction.reply({
            embeds: [{
                title: `An error has occurred. This was most likely because a track was loading when you sent the command.`,
                description: `\`\`\`${ e }\`\`\``,
                color: 0x00ff00,
            }],
        }));
        await q.skip();

    },
};
