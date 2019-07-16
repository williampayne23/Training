const log4js = require('log4js')
const csv = require('csv-streamify');
const fs = require('fs');
const xmlparse = require('fast-xml-parser');
const he = require('he');
const moment = require("moment")

const User = require("./user");
const Transaction = require("./transaction")

const logger = log4js.getLogger('file');

let lineNum = 0;

const invalidTransactions = [];

function checkInvalids() {
    if (invalidTransactions.length !== 0) {
        console.log("Finished parsing file with these invalid lines please fix");
        invalidTransactions.forEach(t => console.log(`${t[0]}: ${t[1]}`))
    }
}

module.exports = {
    csv: function (filename) {
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
                result.forEach(parseLine);
                checkInvalids();
                resolve();
            })

            fs.createReadStream(filename).pipe(parser);
        })
    },
    json: async function (file) {
        let data = await fs.readFileSync(file);
        let parsedJson = JSON.parse(data);
        parsedJson.forEach((transactionObject) => {
            let line = [transactionObject.Date, transactionObject.FromAccount, transactionObject.ToAccount, transactionObject.Narrative, transactionObject.Amount]
            parseLine(line);
        });
        checkInvalids();
    },
    xml: async function (file) {
        options = {
            ignoreAttributes: false,
            attributeNamePrefix: "",
            attrValueProcessor: a => he.decode(a, {
                isAttributeValue: true
            })
        }
        parsedXml = xmlparse.parse(fs.readFileSync(file, "utf8"), options).TransactionList.SupportTransaction;
        parsedXml.forEach((transactionObject) => {
            date = moment('31/12/1899', "DD/MM/YYYY").add(transactionObject.Date, 'days');
            let line = [date,
                transactionObject.Parties.From,
                transactionObject.Parties.To,
                transactionObject.Description,
                transactionObject.Value
            ];
            parseLine(line);
        })
        checkInvalids();

    }
}

function parseLine(line) {
    lineNum++;
    logger.trace("Parsing csv line " + lineNum)
    transaction = Transaction.createTransactionFromLine(line);
    if (transaction.valid) {
        to = User.getOrMake(transaction.to);
        from = User.getOrMake(transaction.from);
        to.addToTransaction(transaction);
        from.addFromTransaction(transaction);
    } else {
        invalidTransactions.push([lineNum, line]);
    }
}