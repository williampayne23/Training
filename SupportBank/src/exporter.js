fs = require('fs');
xml = require("xml");
moment = require("moment");

module.exports = function (file, transactions) {
    let extention = file.substring(file.lastIndexOf("."));
    switch (extention) {
        case ".csv":
            toCSV(file, transactions);
            break;
        case ".json":
            toJSON(file, transactions);
            break;
        case ".xml":
            toXML(file, transactions);
            break;
        default:
            console.log("Not a valid file format");
            break;
    }
}

function toCSV(file, transactions) {
    let transactionLineArray = ["Date, From, To, Narrative, Amount"];
    transactions.forEach((t) => {
        transactionLineArray.push(`${t.date.format("DD/MM/YYYY")},${t.from},${t.to},${t.reason},${t.amount}`)
    })
    fs.writeFileSync(file, transactionLineArray.join("\n"));
}

function toJSON(file, transactions) {
    let jsonFormattedTransactions = [];
    transactions.forEach((t) => {
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

function toXML(file, transactions) {
    let xmlFormattedTransactions = {
        TransactionList: []
    }

    transactions.forEach(t => {
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