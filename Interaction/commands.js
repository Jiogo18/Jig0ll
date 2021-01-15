const Discord = require('discord.js');
const fs = require('fs');
const defaultCommandsPath = './commands';
var existingCommands = new Discord.Collection();//stocker les commandes et pas les redemander h24
const config = require('./config.js');

module.exports = {

	async getExistingCommands(target, forceUpdate) {
		var commandsStored = existingCommands.get(target);

		if(forceUpdate) {
			console.warn(`getExistingCommands called with forceUpdate.`.yellow);
		}
		
		if(!commandsStored || commandsStored.timeUpdate < Date.now() || forceUpdate) {
			if(commandsStored)
				console.warn(`Asking Discord for existing Commands (ping: ${Date.now() - commandsStored.lastUpdate} ms)`.magenta);

			var commandsGet = [];
			try {
				commandsGet = await target.get();
			} catch(error) {
				console.warn(`Can't get commands from ${target}, it's maybe empty`.yellow);
				commands = [];
			}
			commandsStored = {
				commands: commandsGet,
				lastUpdate: Date.now(),
				timeUpdate: Date.now() + 1000
			}
			existingCommands.set(target, commandsStored);
		}
		return commandsStored.commands;
	},

	resetCacheTimer(target) {
		commands = existingCommands.get(target);
		if(commands) commands.timeUpdate = 0;
	},

	async getCommand(commandName, target) {
		const command = (await this.getExistingCommands(target))
			.find(command => command.name == commandName);
	},
	async getCommandId(commandName, target) {
		const command = await this.getCommand(commandName, target);
		return command ? command.id : undefined;
	},



	commands: new Discord.Collection(),//les commandes stockées par le bot (avec les execute())

	async addCommand(command, target) {

		// on ecrasera forcément les anciens post car on sait pas s'ils sont utilisés (ils restent même si le bot est off)

		const post = { data: {
			name: command.name,
			description: command.description,
			options: command.options
		}};//these are the only JSON Param from Discord API
		
		var ok = true;
		await target.post(post)
			.catch(e => {
				console.error(`Error while posting command ${command.name}`.red);
				ok = false;
			})
			.then(e => {
				this.commands.set(command.name, command);
				this.resetCacheTimer(target);
			});
		return ok;
	},

	async removeCommand(command, target) {
		var ok = new Promise((resolve, reject) => {
			target(command.id);
			target.delete()
			.catch(e => {
				console.error(`Error while removing command ${command.name}`.red);
				console.log(e);
				resolve(false);
			})
			.then(buffer => {
				if(this.commands.has(command.name))
					this.commands.delete(command.name);
					this.resetCacheTimer(target);
				//console.log(`removeCommand is success for ${command.name}`)
				resolve(true);
			});
			target('..');//fait remonter au parent parce que le target() modifie target lui même...
			//ex s'il n'y a pas .. : path: '/applications/494587865775341578/guilds/313048977962565652/commands/792926340126736434/792926340973330462'
		});
		return ok;
	},

	async loadCommands(targetGlobal, targetPrivate) {
		console.log(`Loading commands...`.green);

		const commandFiles = fs.readdirSync(defaultCommandsPath).filter(file => file.endsWith('.js'))
		var cmdsLoaded = [];
		commandFiles.forEach(file => {
			const command = require(`../${defaultCommandsPath}/${file}`);
			if(command) {
				cmdsLoaded.push(command);
			}
			else {
				console.error(`Command not loaded : ${file}`.red);
			}
		});

		var c = {
			before: this.commands.length,
			after: 0,
			total: 0,
			public: 0,
			wip: 0,
			private: 0,
		};

		console.log(`Adding ${cmdsLoaded.length} commands...`.green);
		for (const command of cmdsLoaded) {
			var target;
			if(config.isAllowed({on:'interaction_create', guild: {id:'global'} }, command.security)) {
				target = targetGlobal;
			} else if(config.isAllowed({on:'interaction_create', guild: {id:config.guild_test} }, command.security)) {
				target = targetPrivate;//WIP ou Private
			}
			if(command.security == 'wip')
				console.warn(`Interaction /${command.name} is WIP`.yellow);
			if(!target) {
				console.error(`Interaction /${command.name} can't be loaded anywere with this security`.red);
				target = targetPrivate;//TODO: gérer la sécurité autrement (global: true/false)
				//mais on la stocke quand même
			}

			if(await this.addCommand(command, target)) {
				c.total++;
				if(command.security == 'wip') c.wip++;
				switch(target) {
					case targetPrivate: c.private++; continue;
					case targetGlobal: c.public++; continue;
				}
			}
		}
		console.log(`Loaded ${c.total} commands, ${c.public} public`.green);

		c.after = this.commands.length;
		return c;
	},

	getCommandForData(cmdData) {
		var command = this.commands.get(cmdData.commandName);

		if(!command) {
			return [undefined, `Command unknow: ${cmdData.commandName}`];
		}
		
		if(!config.isAllowed(cmdData, command.security)) {
			return [`You can't do that`];
		}

		var lastArg = cmdData.commandName;

		for(let i=0; i<cmdData.options.length; i++) {//get the sub command named optionName
			//on compare Name et option.name (le nom de l'option)
			//si c'est un message (text) on a Name==true car:
			// => si c'est une sous commande : Value est le nom de la sous commande (on compare Value et name)
			// => sinon type est >=3 (string, number, boolean, ...) donc optionValue peut être n'importe quoi
			const optionName = cmdData.getOptionType(i);
			const optionValue = cmdData.getOptionValue(i);
			const optionNa = optionName!=true ? optionName : optionValue;

			var subCommand;
			if(command.options)
				subCommand = command.options.find(option => option.name == optionNa || (optionName==true && 3 <= option.type));
			if(subCommand == undefined) {
				return [undefined, `Option unknow: ${optionName}`];
			}
			if(!config.isAllowed(cmdData, subCommand.security)) {
				return [`You can't do that`];
			}
			command = subCommand;
			lastArg = optionName;
		}

		return [command, lastArg];
	}

}