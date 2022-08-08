const {SlashCommandBuilder}=require('@discordjs/builders');
const chalk=require('chalk');
const execSync=require('child_process').execSync;

module.exports={
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('shutdown the bot!'),

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
                title: "Shutting down..."
            }], ephemeral: false
        });

        try {
            execSync('sudo pm2 kill', {encoding: 'utf-8'});
        } catch (err) {
            console.log(err);
        }

    }
};
