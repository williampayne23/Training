const log4js = require('log4js')
const readlineSync = require("readline-sync")

const User = require("./user");
const parser = require("./parser");



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

menu();

async function menu() {
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
        } else if (input.substring(0, 13) === "Import File [") {
            let name = input.substring(13, input.length - 1);
            logger.trace("Importing file " + name)
            let extention = name.substring(name.lastIndexOf('.'))
            if (extention == '.csv') {
                logger.info("Importing csv file");
                await parser.csv(name);
            } else if (extention == '.json') {
                logger.info("Importing json file");
                await parser.json(name);
            } else if (extention == '.xml') {
                logger.info("Importing xml file");
                await parser.xml(name);
            } else {
                logger.error("Invalid file type" + extension);
                console.log("This is an invalid file type: " + extention);
            }
        } else {
            console.log(input + " is not a command");
        }
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