const {SlashCommandBuilder}=require('@discordjs/builders');
const {
    MessageEmbed, Modal, MessageActionRow, TextInputComponent, MessageButton,
}=require('discord.js');
const chalk=require('chalk');

module.exports={
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears the queue!'),

    async execute(interaction, client, player) {
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
                title: `Queue cleared!`,
                color: 0x00ff00,
            }],
            ephemeral: false
        });
        q.destroy(false)
    },
};
