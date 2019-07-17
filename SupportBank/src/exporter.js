Bank = require('./bank');
fs = require('fs')

module.exports = function (file) {
    extention = file.substring(file.lastIndexOf("."));
    switch (extension) {
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
    let transactionLineArray = [];
    Bank.transactions.forEach((t) => {
        if (t.valid) {
            transactionLineArray.push(`${t.date.format("DD/MM/YYYY")},${t.from},${t.to},${t.reason},${t.amount}`)
        }
    })
    fs.writeFileSync(file, transactionLineArray.join("\n"));
}

function json(file) {
    //TODO JSON ouptut
}

function xml(file) {
    //TODO Xml output
}