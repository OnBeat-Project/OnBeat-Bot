const {
    SlashCommandBuilder
}=require("@discordjs/builders");
/*const {
  EmbedBuilder
} = require("discord.js");
*/

const execSync=require('child_process').execSync;



module.exports={
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription("This command is not authorized to be used by users!"),
    run: async (interaction) => {
        let validIds=["407859300527243275"];

        if (!validIds.includes(interaction.member.id)) {
            return interaction.reply({
                embeds: [{
                    title: "You are not allowed to use this command!"
                }]
            });
        }
        await interaction.reply({
            embeds: [{
                title: "Restarting..."
            }], ephemeral: true
        });
        
        try {
            execSync('pm2 restart 0', {encoding: 'utf-8'});
        } catch (err) {
            console.log(err);
        }

    },
};
