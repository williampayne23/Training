fs = require('fs');
xml = require("xml");
moment = require("moment");

module.exports = function (file) {
    let extention = file.substring(file.lastIndexOf("."));
    switch (extention) {
        case ".csv":
            return new csvExporter(file);
        case ".json":
            return new jsonExporter(file);
        case ".xml":
            return new xmlExporter(file);
        default:
            console.log("Not a valid file format");
            return null;
    }
}


class Exporter {
    constructor(file) {
        this.file = file
    }

    write(transactions) {
        let data = this.getFormattedData(transactions);
        fs.writeFileSync(this.file, data);
    }

    getFormattedData(transactions) {
        return "";
    }
}

class csvExporter extends Exporter {
    getFormattedData(transactions) {
        let transactionLineArray = ["Date, From, To, Narrative, Amount"];
        transactions.forEach((t) => {
            transactionLineArray.push(`${t.date.format("DD/MM/YYYY")},${t.from},${t.to},${t.reason},${t.amount}`)
        })
        return transactionLineArray.join("\n");
    }
}

class jsonExporter extends Exporter {
    getFormattedData(transactions) {
        let jsonFormattedTransactions = [];
        transactions.forEach((t) => {
            let formattedTransaction = {
                Date: t.date.format(),
                FromAccount: t.from,
                ToAccount: t.to,
                Narrative: t.reason,
                Amount: t.amount
            }
            jsonFormattedTransactions.push(formattedTransaction);
        })
        return JSON.stringify(jsonFormattedTransactions, null, 4);
    }
}


class xmlExporter extends Exporter {
    getFormattedData(transactions) {
        let xmlFormattedTransactions = {
            TransactionList: []
        }

        transactions.forEach(t => {
            let xmlFormattedTransaction = {
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
        return '<?xml version="1.0" encoding="utf-8"?>\n' + xml(xmlFormattedTransactions, true);
    }
}