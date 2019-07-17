Bank = require('./bank');
fs = require('fs')

module.exports = function (file) {
    let extention = file.substring(file.lastIndexOf("."));
    switch (extention) {
        case ".csv":
            csv(file);
            break;
        case ".json":
            json(file);
            break;
        case ".xml":
            xml(file);
            break;
        default:
            break;
    }
}

function csv(file) {
    let transactionLineArray = ["Date, From, To, Narrative, Amount"];
    Bank.transactions.forEach((t) => {
        transactionLineArray.push(`${t.date.format("DD/MM/YYYY")},${t.from},${t.to},${t.reason},${t.amount}`)
    })
    fs.writeFileSync(file, transactionLineArray.join("\n"));
}

function json(file) {
    jsonFormattedTransactions = [];
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
    outputString = JSON.stringify(jsonFormattedTransactions, null, 4);
    fs.writeFileSync(file, outputString);
}

function xml(file) {
    //TODO Xml output
}