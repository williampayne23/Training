fs = require('fs');
xml = require("xml");
moment = require("moment");

Bank = require('./bank');

module.exports = function (file) {
    let extention = file.substring(file.lastIndexOf("."));
    switch (extention) {
        case ".csv":
            toCSV(file);
            break;
        case ".json":
            toJSON(file);
            break;
        case ".xml":
            toXML(file);
            break;
        default:
            break;
    }
}

function toCSV(file) {
    let transactionLineArray = ["Date, From, To, Narrative, Amount"];
    Bank.transactions.forEach((t) => {
        transactionLineArray.push(`${t.date.format("DD/MM/YYYY")},${t.from},${t.to},${t.reason},${t.amount}`)
    })
    fs.writeFileSync(file, transactionLineArray.join("\n"));
}

function toJSON(file) {
    let jsonFormattedTransactions = [];
    Bank.transactions.forEach((t) => {
        formattedTransaction = {
            Date: t.date.format(),
            FromAccount: t.from,
            ToAccount: t.to,
            Narrative: t.reason,
            Amount: t.amount
        }
        jsonFormattedTransactions.push(formattedTransaction);
    })
    let outputString = JSON.stringify(jsonFormattedTransactions, null, 4);
    fs.writeFileSync(file, outputString);
}

function toXML(file) {
    let xmlFormattedTransactions = {
        TransactionList: []
    }

    Bank.transactions.forEach(t => {
        xmlFormattedTransaction = {
            SupportTransaction: [{
                _attr: {
                    Date: t.date.diff(moment("31/12/1899", "DD/MM/YYYY"), "days")
                }
            }, {
                Description: t.reason
            }, {
                Value: t.amount
            }, {
                Parties: [{
                        From: t.from
                    },
                    {
                        To: t.to
                    }
                ]
            }]
        }
        xmlFormattedTransactions.TransactionList.push(xmlFormattedTransaction);
    })

    let outputString = '<?xml version="1.0" encoding="utf-8"?>\n' + xml(xmlFormattedTransactions, true);
    fs.writeFileSync(file, outputString);
}