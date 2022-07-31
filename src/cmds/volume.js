const {SlashCommandBuilder}=require('@discordjs/builders');
const {
    MessageEmbed, Modal, MessageActionRow, TextInputComponent, MessageButton,
}=require('discord.js');
const chalk=require('chalk');

require("discord-player/smoothVolume");

module.exports={
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('volume!')
            .addIntegerOption((option) => option
                .setName('volume')
                .setRequired(true)
                .setDescription('Volume percentage.')),

    async execute(interaction, client, player) {
        let vol = interaction.options.getInteger('volume');

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

        if (vol<0||vol>150) return await interaction.reply({
            embeds: [{
                title: "Volume must be between 0 and 150!",
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
                title: `Volume set to ${vol}%`,
                color: 0x00ff00,
            }],
            ephemeral: true
        });
        q.setVolume(vol);

    },
};
