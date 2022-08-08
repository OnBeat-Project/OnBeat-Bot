const {SlashCommandBuilder}=require('@discordjs/builders');
const {MessageEmbed}=require('discord.js');
const {mem, cpu, os}=require('node-os-utils');
const chalk=require('chalk');
const execSync=require('child_process').execSync;

module.exports={
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart the bot!'),

    async execute(interaction) {
        console.log(`${ chalk.greenBright('[EVENT ACKNOWLEDGED]') } interactionCreate with command bot`);
        let validIds=["407859300527243275", "928624781731983380"];

        if (!validIds.includes(interaction.member.id)) {
            return interaction.reply({
                embeds: [{
                    title: "You are not allowed to use this command!"
                }], ephemeral: true
            });
        }
        await interaction.reply({
            embeds: [{
                title: "Restarting..."
            }], ephemeral: false
        });

        try {
            execSync('sudo pm2 restart 0', {encoding: 'utf-8'});
        } catch (err) {
            console.log(err);
        }

    }
};
