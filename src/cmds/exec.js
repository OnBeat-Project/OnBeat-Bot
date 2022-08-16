const {
    SlashCommandBuilder
}=require('@discordjs/builders');
const {Client}=require('discord.js');
const {exec}=require('child_process');

module.exports={
    data: new SlashCommandBuilder()
        .setName('exec')
        .setDescription('Execute a command.')
        .addStringOption(option => option
            .setName('command')
            .setDescription('Command to execute.')
            .setRequired(true)
        ),
    async execute(interaction) {
        const comm=interaction.options.getString('command');
        await interaction.deferReply();
        exec((comm), (error, stdout) => {
            if (error) {
                interaction.followUp({
                    embeds: [{
                        title: 'Error',
                        description: error,
                    }],
                    ephemeral: true
                });
            } else {
                interaction.followUp({
                    embeds: [{
                        title: 'Output',
                        description: stdout,
                    }],
                    ephemeral: true
                });
            }
        });
    }
};