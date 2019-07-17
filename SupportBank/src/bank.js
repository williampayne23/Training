const log4js = require('log4js');
const logger = log4js.getLogger('file');

const User = require('./user');
const Transaction = require('./transaction');

const parserGetter = require('./parserGetter');
const exporterGetter = require('./exporterGetter');

module.exports = class Bank {
	constructor() {
		this.transactions = [];
		this.users = [];
		this.files = [];
	}

	addTransaction(transaction) {
		this.transactions.push(transaction);
		const to = this.getOrMakeUser(transaction.to);
		const from = this.getOrMakeUser(transaction.from);
		to.addToTransaction(transaction);
		from.addFromTransaction(transaction);
	}

	addTransactionFromLine(line) {
		const transaction = new Transaction(line[0], line[1], line[2], line[3], line[4]);
		this.addTransaction(transaction);
		return transaction;
	}

	getOrMakeUser(name) {
		let result = this.users.find((user) => user.username === name);
		if (result === undefined) {
			logger.info('Creating new user ' + name);
			result = new User(name);
			this.users.push(result);
		}
		return result;
	}

	getUser(name) {
		return this.users.find((user) => user.username === name);
	}

	printUserInfo(name) {
		logger.trace(`Getting ${name} user info`);
		const u = this.getUser(name);
		if (u === undefined) {
			logger.warn('Not valid user giving up');
			console.log('No such user');
		} else {
			logger.trace('Valid user, getting complete summary');
			console.log(u.getCompleteSummary().join('\n'));
		}
	}

	printAllUserSummary() {
		this.users.forEach(u => {
			logger.trace('Getting quick summary for ' + u.username);
			console.log(u.toString());
		});
	}

	fileIsLoaded(file) {
		return this.files.includes(file);
	}

	getLoadedFiles() {
		return this.files;
	}

	async import(file) {
		if (this.fileIsLoaded(file)) {
			console.log('This file is already loaded');
			return;
		}
		this.files.push(file);

		const parser = parserGetter(file);
		if (parser !== null) {
			const lines = await parser.getParsedTransactionLines();
			lines.forEach((line) => {
				this.addTransactionFromLine(line);
			});
			parser.checkInvalids();
		}
	}

	export(file) {
		const exporter = exporterGetter(file);
		if (exporter !== null) {
			exporter.write(this.transactions);
		}
	}
};