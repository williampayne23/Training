const readlineSync = require('readline-sync');
const csv = require('csv-streamify');
const fs = require('fs');

const users = [];

const parser = csv({ objectMode : true }, (err, result) => {
    if(err){
        console.error(err);
        return;
    }
    result.shift();
    result.forEach(parseCsvLine);
    users.forEach(u => {
        console.log(u.getQuickSummary())
    });
})

function parseCsvLine(line){
    transaction = Transaction.createTransactionFromLine(line);
    to = User.getOrMake(transaction.to);
    from = User.getOrMake(transaction.from);
    to.addToTransaction(transaction);
    from.addFromTransaction(transaction);
}


fs.createReadStream('./Transactions2014.csv').pipe(parser);

class Transaction {
    constructor(date, to, from, reason, amount){
        this.date = date;
        this.to = to;
        this.from = from;
        this.reason = reason;
        this.amount = amount;
    }

    static createTransactionFromLine(line){
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
        this.runningTotal = parseFloat(this.runningTotal) + parseFloat(transaction.amount);
        this.transactions.push(transaction);
    }

    addFromTransaction(transaction){
        this.runningTotal -= transaction.amount;
        this.transactions.push(transaction);
    }

    static getOrMake(name){
        let result = users.find((user) => user.username === name);
        if(result === undefined) {
            result = new User(name)
            users.push(result)
        }
        return result;
    }

    getQuickSummary(){
        if(this.runningTotal > 0){
            return this.username + " is owed £" + this.runningTotal.toFixed(2);
        }else if(this.runningTotal < 0){
            return this.username + " owes £" + (-this.runningTotal).toFixed(2);
        }else{
            return this.username + "is completely even";
        }
    }

    getCompleteSummary(){
        
    }
}