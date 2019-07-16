const log4js = require('log4js')
const csv = require('csv-streamify');
const fs = require('fs');
const moment = require('moment')
const users = [];
const invalidTransactions = [];
let lineNum = 0;

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'trace'}
    }
});

const logger = log4js.getLogger('file');

const parser = csv({ objectMode : true }, (err, result) => {
    if(err){
        console.error(err);
        logger.error(err)
        return;
    }
    result.shift();
    result.forEach(parseCsvLine);
    if(process.argv[2] === "All"){
        logger.trace("Finding all users")
        findAll();
    }else if(process.argv[2] === undefined){
        logger.info("No command string given exiting")
        console.log("Give a username as an argument or \"All\"");
    }else {
        logger.trace("Getting specific user info")
        let u = User.get(process.argv[2])
        if(u === undefined){
            logger.error("Not valid user exiting")
            console.log("No such user");
        }else{
            logger.trace("Valid user, getting complete summary")
            u.getCompleteSummary();
        }
    }
    if(invalidTransactions.length > 0){
        console.log("Finished program with the invalid lines ")
        invalidTransactions.forEach(t => {
            console.log(t);
        })
        console.log("These lines were ommited");
    }
})

fs.createReadStream('./DodgyTransactions2015.csv').pipe(parser);

function findAll(){
    users.forEach(u => {
        logger.trace("Getting quick summary for " + u.username)
        u.getQuickSummary();
    });
}

function parseCsvLine(line){
    lineNum++;
    logger.trace("Passing csv line " + lineNum)
    transaction = Transaction.createTransactionFromLine(line);
    if(transaction.valid){
        to = User.getOrMake(transaction.to);
        from = User.getOrMake(transaction.from);
        to.addToTransaction(transaction);
        from.addFromTransaction(transaction);
    }else{
        invalidTransactions.push("Line: " + lineNum + ", Data: " + line);
    }
}

class Transaction {
    constructor(date, to, from, reason, amount){
        this.valid = true;
        logger.info("Parsing date " + date);
        this.date = moment(date, "DD/MM/YYYY");
        if(!this.date.isValid()){ 
            this.valid = false;
            logger.error("Invalid date")
        }
        this.to = to;
        this.from = from;
        this.reason = reason;
        this.amount = parseFloat(amount);
        logger.info("Parsing amount " + amount + " to " + this.amount);
        if(!this.amount && this.amount !== 0) {
            this.valid=false;
            logger.error("Cannot parse amount")
        };
    }

    static createTransactionFromLine(line){
        if(line.length !== 5) logger.error("Line has " + line.length + " elements insead of 5");
        return new Transaction(line[0], line[1], line[2], line[3], line[4]);
    }
}

class User {
    constructor(name){
        this.username = name;
        this.transactions = [];
        this.runningTotal = 0;
    }

    addToTransaction(transaction){
        this.runningTotal = this.runningTotal + transaction.amount;
        this.transactions.push(transaction);
    }

    addFromTransaction(transaction){
        this.runningTotal -= transaction.amount;
        this.transactions.push(transaction);
    }

    getQuickSummary(){
        if(this.runningTotal > 0){
            console.log(`${this.username} is owed £${this.runningTotal.toFixed(2)}`);
        }else if(this.runningTotal < 0){
            console.log(`${this.username} owes £${-this.runningTotal.toFixed(2)}`);
        }else{
            console.log(`${this.username} is completely even`);
        }
    }

    getCompleteSummary(){
        this.transactions.sort((a, b) => a.date - b.date);
        console.log(this.username + " transaction summary");
        this.transactions.forEach((t) => {
            if(t.to === this.username){
                console.log(`On ${t.date.format("MMMM Do YYYY")} ${t.from} lent ${t.amount} for ${t.reason}`) 
            }else{
                console.log(`On ${t.date.format("MMMM Do YYYY")} ${t.to} borrowed ${t.amount} for ${t.reason}`);
            }
        })
    }

    static getOrMake(name){
        let result = users.find((user) => user.username === name);
        if(result === undefined) {
            logger.info("Creating new user " + name);
            result = new User(name)
            users.push(result)
        }
        return result;
    }

    static get(name){
        return users.find((user) => user.username === name);
    }
}