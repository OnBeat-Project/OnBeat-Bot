const {
  MessageEmbed
} = require("discord.js");

module.exports = (client) => {
  client.player.on("error", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
  });
  client.player.on("connectionError", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
  });
  client.player.on("trackStart", (queue, track) => {
    const embed = new MessageEmbed()
    .setTitle("🎵 | Playing")
    .setDescription(`Now is playing \`${track.title}\` (\`${track.duration}\`) from \`${track.author}\``)
    .setFooter({
      iconURL: track.requestedBy.displayAvatarURL(), text: `Requested By: ${track.requestedBy.username}`
    })
    .setColor("RANDOM");
    queue.metadata.send({
      embeds: [embed]}).then(message => {
        setTimeout(() => {
          message.delete()
        }, track.durationMS);
      });
  });
  client.player.on("trackAdd", (queue, track) => {
    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
  });
}