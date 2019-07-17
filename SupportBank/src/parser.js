const log4js = require('log4js')
const logger = log4js.getLogger('file');

const csv = require('csv-streamify');
const fs = require('fs');
const xmlparse = require('fast-xml-parser');
const he = require('he');
const moment = require("moment")

const Bank = require("./bank")

let lineNum = 0;

const invalidTransactions = [];

function checkInvalids() {
    if (invalidTransactions.length !== 0) {
        console.log("Finished parsing file but ignored these invalid entries please fix them!");
        invalidTransactions.forEach(t => console.log(`${t[0]}: ${t[1]}`))
    }
}

module.exports = async function (file) {
    lineNum = 0;
    logger.trace("Importing file " + file)
    let extention = file.substring(file.lastIndexOf('.'))
    if (extention == '.csv') {
        logger.info("Importing csv file");
        return await parseCSV(file);
    } else if (extention == '.json') {
        logger.info("Importing json file");
        return await parseJSON(file);
    } else if (extention == '.xml') {
        logger.info("Importing xml file");
        return await parseXML(file);
    } else {
        logger.error("Invalid file type" + extension);
        console.log("This is an invalid file type: " + extention);
    }
    checkInvalids();
}

function parseCSV(filename) {
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
            result.forEach(line => {
                line[0] = moment(line[0], "DD/MM/YYYY");
                parseLine(line);
            });
            resolve();
        })

        fs.createReadStream(filename).pipe(parser);
    })
}
async function parseJSON(file) {
    let data = await fs.readFileSync(file);
    let parsedJson = JSON.parse(data);
    parsedJson.forEach((transactionObject) => {
        date = moment(transactionObject.Date);
        let line = [date, transactionObject.FromAccount, transactionObject.ToAccount, transactionObject.Narrative, transactionObject.Amount]
        parseLine(line);
    });
}
async function parseXML(file) {
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

}

function parseLine(line) {
    lineNum++;
    logger.trace("Parsing csv line " + lineNum)
    validatedLine = validateLine(line);
    if (validatedLine !== null) {
        Bank.addTransactionFromLine(validatedLine)
    }
}

function validateLine(line) {
    let parsedAmount = parseFloat(line[4]);
    if (line.length !== 5) {
        logger.error("Line has " + line.length + " elements insead of 5");
        invalidTransactions.push([lineNum, line]);
        return null;
    } else if (!parsedAmount && parsedAmount !== 0) {
        invalidTransactions.push([lineNum, line]);
        return null;
    } else if (!line[0].isValid()) {
        invalidTransactions.push([lineNum, line]);
        return null;
    } else {
        return line;
    }
}