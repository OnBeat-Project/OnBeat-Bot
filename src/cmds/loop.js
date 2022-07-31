const {SlashCommandBuilder}=require('@discordjs/builders');
const {
    MessageEmbed, Modal, MessageActionRow, TextInputComponent, MessageButton,
}=require('discord.js');
const chalk=require('chalk');

module.exports={
    data: new SlashCommandBuilder()
        .setName('repeat')
        .setDescription('Repeat options')
        .addStringOption((stringoption) => stringoption
            .setName('repeat')
            .setDescription('Repeat options')
            .setRequired(true)
            .addChoices({
                name: 'Disable repeat',
                value: 'none'
            }, {
                name: 'Repeat current track',
                value: 'track'
            }, {
                name: 'Repeat queue',
                value: 'queue'
            }
            ),

        ),
    async execute(interaction, client, player) {
        const ret=interaction.options.getString('repeat')

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
    if (ret==='queue') {
        interaction.reply({
            embeds: [{
                title: `Repeating queue!`,
                color: 0x00ff00,
            }],
            ephemeral: false
        });
        await q.setRepeatMode(3);
    } else if (ret==='track') {
        interaction.reply({
            embeds: [{
                title: `Repeating current track!`,
                color: 0x00ff00,
            }],
            ephemeral: false
        });
        await q.setRepeatMode(2);
    } else {
        interaction.reply({
            embeds: [{
                title: `Repeat disabled!`,
                color: 0x00ff00,
            }],
            ephemeral: false
        });
        await q.setRepeatMode(0);
    }
},
};
