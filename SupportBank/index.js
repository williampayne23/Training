const log4js = require('log4js');
const readlineSync = require('readline-sync');

const Bank = require('./src/bank');

log4js.configure({
	appenders: {
		file: {
			type: 'fileSync',
			filename: 'debug.log'
		}
	},
	categories: {
		default: {
			appenders: ['file'],
			level: 'trace'
		}
	}
});

menu();

async function menu() {
	const bank = new Bank();
	while (true) {
		const input = readlineSync.question('Give a command: ');
		const command = getCommand(input);
		switch (command.command) {
		case 'List All':
			bank.printAllUserSummary();
			break;
		case 'List [':
			bank.printUserInfo(command.data);
			break;
		case 'Import File [':
			await bank.import(command.data);
			break;
		case 'Export File [':
			bank.export(command.data);
			break;
		case 'List Files':
			console.log('These files are loaded...');
			console.log(bank.getLoadedFiles().join('\n'));
			break;
		case 'Stop':
			return;
		default:
			console.log('Not a valid command');
			break;
		}
	}
}

function getCommand(input) {
	const openIndex = input.indexOf('[') + 1;
	if (openIndex === 0) {
		return {
			command: input
		};
	} else {
		return {
			command: input.substring(0, openIndex),
			data: input.substring(openIndex, input.length - 1)
		};
	}
}