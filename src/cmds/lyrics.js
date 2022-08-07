const {SlashCommandBuilder}=require('@discordjs/builders');
const chalk=require('chalk');
const {Lyrics}=require("@discord-player/extractor");
const lyricsClient=Lyrics.init();

module.exports={
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Show lyrics'),

    async execute(interaction, client, player) {

        interaction.deferReply();
        if (!interaction.member.voice.channelId) return await interaction.followUp({
            embeds: [{
                title: "You are not in a voice channel!",
                color: 0xFF0000
            }],
            ephemeral: true
        });
        if (interaction.guild.me.voice.channelId&&interaction.member.voice.channelId!==interaction.guild.me.voice.channelId) return await interaction.followUp({
            embeds: [{
                title: "You are not in my voice channel!",
                color: 0xFF0000
            }],
            ephemeral: true
        });

        let q=player.getQueue(`${ interaction.guild.id }`);
        if (!q||q===undefined||q.length===0) return await interaction.followUp({
            embeds: [{
                title: "Nothing is playing!",
                color: 0x00ff00,
            }],
            ephemeral: true
        });
        lyricsClient.search(q.current.title).then(async (lyrics) => {
            if (!lyrics) return await interaction.followUp({
                embeds: [{
                    title: "No lyrics found!",
                    color: 0x00ff00,
                }],
                ephemeral: true
            });
            await interaction.followUp({
                embeds: [{
                    title: `Lyrics for ${ q.current.title }`,
                    description: lyrics.lyrics,
                    color: 0x00ff00,
                    footer: {
                        text: `Requested by ${ interaction.user.tag }`
                    },
                    thumbnail: {
                        url: lyrics.thumbnail
                    }
                }],
                ephemeral: false
            });
        }
        ).catch(async (err) => {
            console.log(chalk.red(err));
            await interaction.followUp({
                embeds: [{
                    title: "No lyrics found!",
                    color: 0x00ff00,
                }],
                ephemeral: true
            });
        }
        );
    },
};
