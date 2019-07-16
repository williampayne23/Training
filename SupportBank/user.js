const log4js = require('log4js')
const logger = log4js.getLogger('file');

const users = [];

module.exports = class User {
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

    static forEach(fnx){
        return users.forEach(fnx);
    }
}