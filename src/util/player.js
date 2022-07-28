const {
  EmbedBuilder
} = require("discord.js");
const {
  MessageActionRow,
  MessageButton
} = require('discord.js');

module.exports = (client) => {
  client.player.on("error", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
  });
  client.player.on("connectionError", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
  });
  /* client.player.on("trackStart", async(queue, track) => {
    });*/
  client.player.on("trackAdd", async(queue, track) => {
    if (!queue.metadata) return;
    queue.metadata.send({
      content: `🎶 | Track **${track.title}** added to queue!\n🙆 | Requested by ${track.requestedBy.tag}`,
      ephemeral: true
    })
  });
  /*client.player.on("queueEnd", (queue, track) => {
    // queue.metadata.deleteReply()
  })*/
}