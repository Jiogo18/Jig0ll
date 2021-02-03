const security = require('./security.js');
const AppManager = require('./AppManager.js');

module.exports = class InteractionBase {
	bot = undefined;
	static config = require('./config.js');
	static security = require('./security.js');
	commandsMgr = require('./commandsManager.js');

	constructor(bot) {
		//format des demandes d'interactions '</COMMAND:BOT_ID> '
		//format des retours d'interactions: 'réponse'
		this.bot = bot;
		AppManager.setBot(bot);
	}

	global() { return AppManager.getGlobal(); }
	guilds(id) { return AppManager.getGuild(id); }
	getTarget(id) { return AppManager.getTarget(id); }
	getCmdFrom(guild_id = undefined) { return AppManager.getCmdFrom(guild_id); }

	async loadCommands() {
		const targetPrivate = this.getTarget(security.guild_test);
		const targetGlobal = this.getTarget();
		return this.commandsMgr.loadCommands(targetGlobal, targetPrivate);
	}

	async cleanCommands(target_id = undefined) {
		const target = this.getTarget(target_id);

		const commandsAvailable = await this.commandsMgr.getExistingCommands(target);
		if (!commandsAvailable) {
			console.error(`Can't get commands for ${target_id ? target_id : 'Global'}`);
			return;
		}

		//console.log(`commands before : ${(await this.commandsMgr.getExistingCommands(target)).length}`);
		var promises = [];
		for (const command of commandsAvailable) {
			promises.push(this.commandsMgr.removeCommand(command, target));
		}
		await Promise.all(promises);
		//console.log(`commands remaning : ${(await this.commandsMgr.getExistingCommands(target)).length}`)

		if (this.commandsMgr.commands.length > 0) {
			console.error(`${this.commandsMgr.commands.length} Slash Commands remain after cleanCommands`.red);
		}
		else {
			console.log(`All Slash Commands of ${target_id ? target_id : 'Global'} have been removed.`);
		}
	}
}

