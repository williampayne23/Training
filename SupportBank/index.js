const log4js = require('log4js');
const readlineSync = require("readline-sync");

const parser = require("./src/parser");
const exporter = require("./src/exporter");
const Bank = require("./src/bank");

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
        const command = getCommand(input);
        console.log(command[0])
        switch (command[0]) {
            case "List All":
                logger.trace("Finding all users")
                Bank.printAllUserSummary();
                break;
            case "List [":
                Bank.printUserInfo(command[1]);
                break;
            case "Import File [":
                await parser(command[1]);
                break;
            case "Export File [":
                exporter(command[1]);
                break;
            case "Stop":
                return;
            default:
                console.log("Not a valid command")
                break;
        }
    }
}

function getCommand(input) {
    openIndex = input.indexOf('[') + 1;
    if (openIndex === 0) {
        return [input, ""];
    } else {
        return [input.substring(0, openIndex), input.substring(openIndex, input.length - 1)]
    }
}