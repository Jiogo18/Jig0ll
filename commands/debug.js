import { MessageMaker } from '../lib/messageMaker.js';

const done = new MessageMaker('Done');


const options = [{
	name: 'empty_answer',
	description: "Test un retour vide lors de l'appel de l'interaction",
	execute: (cmdData) => { cmdData.sendAnswer(done) }
},{
	name: 'error',
	description: "Fait une erreur lors de l'exécution",
	execute: () => { throw `Erreur demandée par '/test error'` }
},{
	name: 'sleep',
	description: "Prend 5 secondes pour répondre",
	execute: () => { sleep(5000); return done; }
},{
	name: 'await',
	description: "Prend 5 secondes pour répondre",
	execute: async () => { await sleepAwait(5000); return done; }
}];


export default {
	name: 'debug',
	description: 'Tests diverses',
	interaction: true,

	security: {
		place: 'private',
	},

	options: [{
		name: 'choice',
		description: 'Choix du test',
		type: 1,
		default: true,

		options: [{
			name: 'fonction',
			description: 'Choix du test',
			type: 3,
			required: true,

			choices: options.filter(o => o.name).map(o => { return { name: o.name, value: o.value || o.name } }),
		}],
		executeAttribute(cmdData, levelOptions) {
			const optionName = levelOptions[0].value;
			const option = options.find(o => (o.value||o.name) == optionName );
			if(!option) return new MessageMaker(`There is no option for ${optionName}`);
			if(typeof option.execute != 'function') return new MessageMaker(`Option ${optionName} is incomplete`);
	
			return option.execute(cmdData, levelOptions);
		}
	},{
		name: 'surprivate', description: 'Commande impossible à executer', type: 1,
		security: { place: 'none', }
	}],
};





/**
 * @param {number} milliseconds - time to sleep in milliseconds
 */
function sleep(milliseconds) {
	const start = Date.now();
	while (Date.now() - start < milliseconds);
}
/**
 * @param {number} time - time to sleep in milliseconds
 */
async function sleepAwait(time) {
	await new Promise(r => setTimeout(r, time));
}