const log4js = require('log4js')
const csv = require('csv-streamify');
const fs = require('fs');

const User = require("./user");
const Transaction = require("./transaction")

const logger = log4js.getLogger('file');

let lineNum = 0;

module.exports = function (filename) {
    return new Promise((resolve, reject) => {
        const parser = csv({
            objectMode: true
        }, (err, result) => {
            if (err) {
                console.error(err);
                logger.error(err)
                reject(err);
            }
            result.shift();
            result.forEach(parseCsvLine);
            resolve();
        })

        fs.createReadStream(filename).pipe(parser);
    })
}

function parseCsvLine(line) {
    lineNum++;
    logger.trace("Parsing csv line " + lineNum)
    transaction = Transaction.createTransactionFromLine(line);
    if (transaction.valid) {
        to = User.getOrMake(transaction.to);
        from = User.getOrMake(transaction.from);
        to.addToTransaction(transaction);
        from.addFromTransaction(transaction);
    } else {
        invalidTransactions.push("Line: " + lineNum + ", Data: " + line);
    }
}