const readlineSync = require('readline-sync');
const csv = require('csv-streamify');
const fs = require('fs');
const moment = require('moment')
const users = [];

const parser = csv({ objectMode : true }, (err, result) => {
    if(err){
        console.error(err);
        return;
    }
    result.shift();
    result.forEach(parseCsvLine);
    if(process.argv[2] === "All"){
        findAll();
    }else if(process.argv[2] === undefined){
        console.log("Give a username as an argument or \"All\"");
    }else {
        let u = User.get(process.argv[2])
        if(u === undefined){
            console.log("No such user");
        }else{
            u.getCompleteSummary();
        }
    }
})

function findAll(){
    users.forEach(u => {
        u.getQuickSummary();
    });
}

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
        this.date = moment(date, "DD/MM/YYYY");
        this.to = to;
        this.from = from;
        this.reason = reason;
        this.amount = parseFloat(amount);
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
            result = new User(name)
            users.push(result)
        }
        return result;
    }

    static get(name){
        return users.find((user) => user.username === name);
    }
}