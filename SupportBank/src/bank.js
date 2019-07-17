const log4js = require('log4js')
const logger = log4js.getLogger('file');

const User = require("./user");
const Transaction = require("./transaction");

const importer = require("./importer");
const exporter = require("./exporter");

module.exports = class Bank {
    constructor() {
        this.transactions = []
        this.users = []
        this.files = []
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
        let to = this.getOrMakeUser(transaction.to);
        let from = this.getOrMakeUser(transaction.from);
        to.addToTransaction(transaction);
        from.addFromTransaction(transaction);
    }

    addTransactionFromLine(line) {
        let transaction = new Transaction(line[0], line[1], line[2], line[3], line[4]);
        this.addTransaction(transaction);
        return transaction;
    }

    getOrMakeUser(name) {
        let result = this.users.find((user) => user.username === name);
        if (result === undefined) {
            logger.info("Creating new user " + name);
            result = new User(name)
            this.users.push(result)
        }
        return result;
    }

    getUser(name) {
        return this.users.find((user) => user.username === name);
    }

    printUserInfo(name) {
        logger.trace(`Getting ${name} user info`)
        let u = this.getUser(name)
        if (u === undefined) {
            logger.warn("Not valid user giving up")
            console.log("No such user");
        } else {
            logger.trace("Valid user, getting complete summary")
            console.log(u.getCompleteSummary().join("\n"));
        }
    }

    printAllUserSummary() {
        this.users.forEach(u => {
            logger.trace("Getting quick summary for " + u.username)
            console.log(u.toString());
        });
    }

    fileIsLoaded(file) {
        if (this.files.includes(file)) {
            return true;
        }
        this.files.push(file);
        return false;
    }

    getLoadedFiles() {
        return this.files;
    }

    async import(file) {
        const parser = importer(file);
        if (parser != null) {
            let lines = await parser.getParsedTransactionLines();
            lines.forEach((line) => {
                this.addTransactionFromLine(line);
            })
            parser.checkInvalids();
        }
    }

    export (file) {
        let fileExporter = exporter(file);
        if (fileExporter !== null) {
            fileExporter.write(this.transactions);
        }
    }
}