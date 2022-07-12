const {
  MessageEmbed
} = require("discord.js");
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = (client) => {
  client.player.on("error", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
  });
  client.player.on("connectionError", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
  });
  client.player.on("trackStart", async(queue, track) => {
    const interaction = queue.metadata;
    const embed = new MessageEmbed()
    .setTitle("🎵 | Playing")
    .setDescription(`Now is playing \`${track.title}\` (\`${track.duration}\`) from \`${track.author}\``)
    .setFooter({
      iconURL: track.requestedBy.displayAvatarURL(), text: `Requested By: ${track.requestedBy.username}`
    })
    .setColor("RANDOM");
    
    
    queue.metadata.send({
      embeds: [embed] }).then(message => {
        
      });
    });
  client.player.on("trackAdd", async(queue, track) => {
    await client.db.add(`track.${track.title}`, 1);
    console.log(await client.db.get("track"))
    queue.metadata.send({
      content: `🎶 | Track **${track.title}** queued!\n🙆 | Requested by ${track.requestedBy.tag}`,
      ephemeral:true
    });
  });
  client.player.on("queueEnd", (queue, track) => {
    // queue.metadata.deleteReply()
  })
}