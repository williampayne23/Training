const log4js = require('log4js')
const readlineSync = require("readline-sync")

const User = require("./user");
const csv = require("./csvParser");

const invalidTransactions = [];


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

const logger = log4js.getLogger('file');

main()

async function main() {
    await csv('Transactions2014.csv')
    menu();
}

function menu() {
    while (true) {
        let input = readlineSync.question("Give a command: ");
        console.log(input)
        if (input === "List All") {
            logger.trace("Finding all users")
            findAll();
        } else if (input.substring(0, 6) === "List [") {
            let username = input.substring(6, input.length - 1);
            logger.trace(`Getting ${username} user info`)
            userInfo(username);
        } else if (input === "Stop") {
            break;
        } else {
            console.log(input + " is not a command");
        }
    }

    if (invalidTransactions.length > 0) {
        console.log("Finished program with the invalid lines ")
        invalidTransactions.forEach(t => {
            console.log(t);
        })
        console.log("These lines were ommited");
    }
}

function findAll() {
    User.forEach(u => {
        logger.trace("Getting quick summary for " + u.username)
        u.getQuickSummary();
    });
}

function userInfo(name) {
    let u = User.get(name)
    if (u === undefined) {
        logger.error("Not valid user exiting")
        console.log("No such user");
    } else {
        logger.trace("Valid user, getting complete summary")
        u.getCompleteSummary();
    }
}