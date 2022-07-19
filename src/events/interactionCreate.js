const {InteractionType} = require('discord.js');

module.exports = {
  event: "interactionCreate",
  oneTime: false,
  run: async (i) => {
    if (i.type !== InteractionType.ApplicationCommand) return;
    // if(!i.isCommand()) return;
    
    const commandCheck = i.client.commands.get(i.commandName);

    if (!commandCheck) {
      return console.log(`Could not find command" '${i.commandName}'`);
    } else {
      await commandCheck.run(i);
    }
  },
};