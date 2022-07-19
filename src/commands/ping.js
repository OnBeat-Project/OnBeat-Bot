const {
  SlashCommandBuilder
} = require( "@discordjs/builders" );
/*const {
  EmbedBuilder
} = require("discord.js");
*/
const {
  EmbedBuilder,
  GuildMember
} = require( "discord.js" );

const {
  mem,
  cpu,
  os
} = require( 'node-os-utils' );

module.exports = {
  data: new SlashCommandBuilder()
    .setName( "ping" )
    .setDescription( "pong!" ),
  run: async ( interaction ) =>
  {
    const { totalMemMb, usedMemMb } = await mem.info();
    const days = Math.floor( interaction.client.uptime / 86400000 );
    const hours = Math.floor( interaction.client.uptime / 3600000 ) % 24;
    const minutes = Math.floor( interaction.client.uptime / 60000 ) % 60;
    const seconds = Math.floor( interaction.client.uptime / 1000 ) % 60;
    let guildsCount = 0;
    let usersCount = 0;

    interaction.client.guilds.cache.forEach( ( g ) =>
    {
      guildsCount++;
      usersCount += g.memberCount;
    } );

    const embed = new EmbedBuilder()
      .setColor( '#00FF00' )
      .addFields(
        { name: 'Servers :computer:', value: `\`\`\`${ guildsCount }\`\`\``, inline: true },
        { name: 'Users :family_mmbb:', value: `\`\`\`${ usersCount }\`\`\``, inline: true },
        { name: 'Shard ID :newspaper:', value: '```1```', inline: true },
        { name: 'API Latency :ping_pong:', value: `\`\`\`${ interaction.client.ws.ping }ms\`\`\``, inline: true },
        { name: 'Discord.js :tools:', value: '```14.0.2```', inline: true },
        { name: 'CPU Usage :bar_chart:', value: `\`\`\`${ await cpu.usage() } %\`\`\``, inline: true },
        { name: 'Uptime :green_circle:', value: `\`\`\`${ days }d ${ hours }h ${ minutes }m ${ seconds }s\`\`\``, inline: true },
      )
      .setDescription( `
\`\`\`asciidoc
OS: ${ await os.oos() }
CPU: ${ cpu.model() }
Cores: ${ cpu.count() }
CPU Usage: ${ await cpu.usage() } %
RAM: ${ totalMemMb } MB
RAM Usage: ${ usedMemMb } MB
\`\`\`
`)
    await interaction.reply( { embeds: [ embed ] } );
  },
};