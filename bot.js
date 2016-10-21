const Bot = require('yamdbf').Bot;
const config = require('./config.json');
const path = require('path');
const bot = new Bot({
    name: 'Reputron',
    token: config.token,
    config: config,
    selfbot: false,
    version: '2.0.0',
    statusText: 'try ??help',
    commandsDir: path.join(__dirname, 'commands'),
	disableBase: [
		'setprefix',
		'disablegroup',
		'enablegroup',
		'listgroups',
		'version',
		'ping',
		'reload'
	]
}).start();

bot.setDefaultSetting('prefix', '');
bot.repTemplate = {
	goodrep: 0,
	badrep: 0,
	reps: [],
	cooldowns: []
}
