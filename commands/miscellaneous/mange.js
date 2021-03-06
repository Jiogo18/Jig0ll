import DiscordBot from '../../bot/bot.js';
import { EmbedMaker } from '../../lib/messageMaker.js';
import { isSnowflake } from '../../lib/snowflake.js';

const logChannels = {
	'313048977962565652': '801844472836784167', //serveur Jiogo #log-manger
	'626121178163183628': '672382487888003092',
};

export default {
	name: 'mange',
	description: 'Donne un compte rendu de son repas inrp\nFormat: `!mange "Elizia" "des chocolats"`',
	interaction: true,

	security: {
		place: 'public',
	},

	options: [
		{
			name: 'personne',
			type: 3,
			description: 'Qui mange ?',
			required: true,
		},
		{
			name: 'quoi',
			type: 3,
			description: 'Manger quoi ?',
			required: true,
		},
	],

	/**
	 * Executed with option(s)
	 * @param {ReceivedCommand} cmdData
	 * @param {[*]} levelOptions
	 */
	async executeAttribute(cmdData, levelOptions) {
		if (levelOptions.length < 2) return new EmbedMaker('Mange', this.description); //n'a pas respecté les options

		const guildId = cmdData.guild.id;
		//le channel dans la liste logChannels ou le channel d'où le message est envoyé
		const channelLog = logChannels[guildId] ? cmdData.bot.channels.cache.get(logChannels[guildId]) : undefined;

		const sujet = await getTarget(cmdData.bot, levelOptions.personne || (levelOptions[0] && levelOptions[0].value));
		const aliment = levelOptions.quoi || (levelOptions[1] && levelOptions[1].value);
		const channelSource = cmdData.channel;
		const strDansChannel = channelSource?.name ? ` dans ${channelSource}` : '';
		const retour = new EmbedMaker('', `Aujourd'hui ${sujet} a mangé ${aliment}${strDansChannel}`);
		if (channelLog) {
			channelLog.send(retour.getForMessage());
		} else {
			return retour; //répond au message
		}
		return new EmbedMaker('', 'Commande effectuée, bon appétit');
	},
};

/**
 * Get a mention of the user
 * @param {DiscordBot} bot The bot
 * @param {string} str The id of the user
 * @returns {Promise<User|string>} Return the user, the mention or the name of the user
 */
async function getTarget(bot, str) {
	if (!isSnowflake(str)) return str;

	const user = await bot.users.fetch(str);
	if (user) {
		if (user.partial == false) return user; //si on a l'user : target == user
		return `<@${str}>`; //si on a un snowflake mais pas vraiment user : <@Snowflake>
	}

	return str; //si on a rien de tout ça : str
}
