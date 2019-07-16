Transaction = require('./transaction');
fs = require('fs')

module.exports = {
    csv: function (file) {
        let transactionLineArray = [];
        Transaction.forEach((t) => {
            if (t.valid) {
                transactionLineArray.push(`${t.date.format("DD/MM/YYYY")},${t.from},${t.to},${t.reason},${t.amount}`)
            }
        })
        fs.writeFileSync(file, transactionLineArray.join("\n"));
    }
}