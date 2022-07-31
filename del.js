require('dotenv').config();
const {REST}=require('@discordjs/rest');
const {Routes}=require('discord-api-types/v9');

const rest=new REST({version: '9'}).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands('930117271802773514', '992884532833423450'), {body: []})
    .then(() => console.log('Successfully deleted all guild commands.'))
    .catch(console.error);

rest.put(Routes.applicationCommands('930117271802773514'), {body: []})
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);
