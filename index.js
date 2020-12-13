require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();//id du bot:<@!494587865775341578>
const Cmd = require("./commandes/commande.js");
var messageNotCmd = [];

const WIPonly = (process.argv.length >= 3 && process.argv[2] == "WIP");


function isWIP(user) {
	switch(user.id) {
		case bot.user.id:
		case process.env.OWNER_ID:
			return true;
	}
	return false;
}


bot.on("ready", () => {
	bot.user.setActivity(`!help || @${bot.user.username} help`, {type: 'WATCHING'})
			.then(presence => console.log(
				`Activitée de ${bot.user.username} mis à "${presence.activities.length>0 ? presence.activities[0].name : 'none'}"`))
			.catch(console.error);
	if(WIPonly) {
		console.warn("You are in WIP mode, @Jig0ll will only answer to @Jiogo18");
	}
});


bot.on("message", message => {
	if(WIPonly && !isWIP(message.author))
		return;//en debug je suis le seul à pouvoir l'activer

	try {
		var msg = Cmd.isCommand(bot, message);
		if(!msg) {//if it's not a command
			var sourceId = 0, sourceName = "Unknow";
			if(message.guild) {
				sourceId = message.guild.id;
				sourceName = message.guild.name+"@"+sourceId+"/"+message.channel.name;
			}
			else if(message.author) {
				sourceId = message.author.id;
				sourceName = "MP^";
			}

			if(!messageNotCmd[sourceId])
				messageNotCmd[sourceId] = 0;
			if(++messageNotCmd[sourceId] >= 200) {//à 200
				messageNotCmd[sourceId] = 0;
				console.warn(`Plus de 200 messages dans ${sourceName}, laissez moi dormir`);
			}
			return;
		}
		console.log(`nouvelle commande dans ${message.id} (par ${message.author.username}@${message.author.id}) : ${message.content}`);
	} catch(error) {
		console.error(`Error with a message: ${error}`);

		return;
	}

	//2 try catch to answer with the error ONLY when it's a command
	try {
		Cmd.action(bot, message, msg);
	} catch (error) {
		message.channel.send(`Sorry I've had an error: ${error}`);
		console.error(error);
	}

});

bot.login();
