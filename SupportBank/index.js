const readlineSync = require('readline-sync');
const csv = require('csv-streamify');
const fs = require('fs');

const parser = csv({ objectMode : true }, (err, result) => {
    result.shift();
    result.forEach(line => console.log(line));
})

fs.createReadStream('./Transactions2014.csv').pipe(parser);