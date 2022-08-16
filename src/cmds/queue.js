const {SlashCommandBuilder}=require('@discordjs/builders');
const {
    MessageEmbed, Modal, MessageActionRow, TextInputComponent, MessageButton,
}=require('discord.js');
const chalk=require('chalk');

module.exports={
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('View queue!'),

    async execute(interaction, client, player) {
        let q=player.getQueue(`${ interaction.guild.id }`);
        if(!interaction.member.voice.channel) return interaction.reply({content: `${interaction.guild.me.voice.channel?`Join in <#${interaction.guild.me.voice.channel.id}> to see queue!`:"Join in a voice channel."}`, ephemeral: true});

        if (!q||q===undefined||q.length===0) return await interaction.reply({
            embeds: [{
                title: "Nothing is playing!",
                color: 0x00ff00,
            }],
            ephemeral: true
        });
        const curr=q.current;
        const tracks=q.tracks.slice(0, 10).map((m, i) => {
            return `${ i+1 }. **${ m.title }** by ${ m.author }`;
        });
        interaction.reply({
            embeds: [{
                title: `Now playing: **${ curr.title }** by **${ curr.author }**`,
                color: 0x00ff00,
                description: `${ tracks.join('\n') }${ q.tracks.length>10
                    ? `\n...${ q.tracks.length-10 } more track(s)`:''
                    }`,
            }],
            ephemeral: false
        });

    },
};
