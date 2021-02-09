import AppManager from '../../Interaction/AppManager.js';
import { MessageMaker, EmbedMaker } from '../../lib/messageMaker.js';
const spaces = '\u200b \u200b \u200b \u200b ';

export default {
	name: 'interaction',
	description: 'Informations sur les intéractions du bot',
	interaction: true,

	security: {
		place: 'private',
		wip: true,
	},

	options: [{
		name: "list",
		description: "Liste des intéractions du bot sur ce serveur",
		type: 1,

		execute: listInteraction
		/*
		options: [{

			//TODO: id du serveur
		}]*/
	},{
		name: "get",
		description: "Donne des informations sur une intéraction",
		type: 1,
		execute() { return  'Work in progress' }
	},{
		name: "clean",
		description: "Nettoye les intéractions",
		type: 1,
		execute: cleanInteraction
	}]
};




async function listInteraction(context) {
	AppManager.setBot(context.bot);
	var globalInte = await AppManager.getCmdFrom()
	var localInte = await AppManager.getCmdFrom(context.guild_id)
	//attendre les 2 intéractions pour envoyer

	const counter = globalInte.length + localInte.length;
	globalInte = globalInte.map(option => { return option.name; });
	localInte = localInte.map(option => { return option.name; });

	const retour = new EmbedMaker('Interaction list', `${counter} interactions are available in this guild`);
	if(globalInte.length > 0) retour.addField('Global', `${spaces}${globalInte.join(`\n${spaces}`,)}`);
	if(localInte.length > 0) retour.addField('Local', `${spaces}${localInte.join(`\n${spaces}`)}`);
	return retour;
}


async function cleanInteraction(context) {
	var slashCmd = context.interactionMgr;

	var globalInte = await slashCmd.getCmdFrom();
	var localInte = await slashCmd.getCmdFrom(context.guild_id);
	const counterBefore = globalInte.length + localInte.length;

	await slashCmd.cleanCommands().catch(e => { console.error('error: cleanCommands global'); });//global
	await slashCmd.cleanCommands(context.guild_id).catch(e => { console.error('error: cleanCommands guild'); console.log(e) });
	await slashCmd.loadCommands();
	globalInte = await slashCmd.getCmdFrom().catch(e => { console.error('error: getCmdFrom 1'); });
	localInte = await slashCmd.getCmdFrom(context.guild_id).catch(e => { console.error('error: getCmdFrom 2'); });
	const counterAfter = globalInte.length + localInte.length;

	return new MessageMaker(`There were ${counterBefore} interactions, there are ${counterAfter}.`);
}