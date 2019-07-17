const log4js = require('log4js')
const logger = log4js.getLogger('file');

const User = require("./user");
const Transaction = require("./transaction");

module.exports = {
    transactions: [],
    users: [],
    addTransaction(transaction) {
        this.transactions.push(transaction);
        to = this.getOrMakeUser(transaction.to);
        from = this.getOrMakeUser(transaction.from);
        to.addToTransaction(transaction);
        from.addFromTransaction(transaction);
    },
    addTransactionFromLine(line) {
        let transaction = new Transaction(line[0], line[1], line[2], line[3], line[4]);
        this.addTransaction(transaction);
        return transaction;
    },
    getOrMakeUser(name) {
        let result = this.users.find((user) => user.username === name);
        if (result === undefined) {
            logger.info("Creating new user " + name);
            result = new User(name)
            this.users.push(result)
        }
        return result;
    },
    getUser(name) {
        return this.users.find((user) => user.username === name);
    },
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
    },
    printAllUserSummary() {
        this.users.forEach(u => {
            logger.trace("Getting quick summary for " + u.username)
            console.log(u.toString());
        });
    }
}