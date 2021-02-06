import security from '../Interaction/security.js';
import MessageMaker from '../lib/messageMaker.js';
import { CommandData, CommandContent } from '../lib/commandData.js';

function makeMessage(description, error) {
	const color = error ? 'red' : undefined;
	return new MessageMaker.Embed('Help', description, {color: color});
}

function getCommandToHelp(cmdData) {
	var commandToHelp = [...cmdData.content.optionsValue];
	if(typeof commandToHelp[0] == 'string') {
		const first = commandToHelp.shift();
		for(const word of first.split(' ').reverse()) {
			commandToHelp.unshift(word);
		}
	}
	

	const cmdData2 = new CommandData(new CommandContent(commandToHelp.shift(), commandToHelp), cmdData.context, cmdData.commandSource, cmdData.interactionMgr);

	const command = cmdData.interactionMgr.commandsMgr.getCommandForData(cmdData2, true);
	return command;
}



export default {
	name: 'help',
	description: 'Affiche les commandes disponibles',
	interaction: true,

	security: {
		place: 'public',
	},

	options: [{
		name: "command",
		description: 'Détaille une commande (/help "bot info")',
		type: 3,
		required: false,

	}],

	executeAttribute(cmdData, levelOptions) {
		const command = getCommandToHelp(cmdData);

		if(typeof command == 'string') { return makeMessage(command, true); }
		if(!command) { return module.exports.execute(cmdData); }
		if(!command.description) { return console.warn(`${command.name} has no description`.yellow); }

		return makeMessage(getFullDescriptionFor(cmdData, command));
	},

	execute(cmdData) {
		return makeMessage(getBetterDescriptionFor('\u200b \u200b \u200b \u200b ', cmdData, cmdData.commands, ''));
	},


	getDescriptionFor: getDescriptionFor,
	getFullDescriptionFor: getFullDescriptionFor,
};


//get a complete description of the command
function getFullDescriptionFor(context, command) {
	return command.description + '\n' + getBetterDescriptionFor('\xa0 \xa0 ', context, command.options, command.commandLine);
}

//get a readable description of options
function getBetterDescriptionFor(spaces, context, options, commandLine) {
	const description = getDescriptionFor(context, options);
	var descriptionStr = [];
	if(commandLine != '') commandLine += ' ';
	for(const line of description || []) {
		const currentCommandLine = commandLine + line.name;
		const desc = line.description ?  ` : ${line.description}` : '';
		descriptionStr.push(spaces + '/' + currentCommandLine + desc);
	}
	//affiche une liste avec une indentation et un retour à la ligne
	return descriptionStr.join('\n');
}

//get the description with objects
function getDescriptionFor(context, commands) {
	if(!commands) return [];

	var retour = [];
	commands.forEach((command, key) => {
		if(!command.security.isAllowedToSee(context)) {
			return;
		}
		var commandName = command.name;
		if(command.type >= 3)
			commandName = `[${commandName}]`;
		retour.push({ name: commandName, description: command.description });
	});

	return retour;
}