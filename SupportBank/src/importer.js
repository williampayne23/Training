const log4js = require('log4js')
const logger = log4js.getLogger('file');

const csv = require('csv-streamify');
const fs = require('fs');
const xmlparse = require('fast-xml-parser');
const he = require('he');
const moment = require("moment")

module.exports = function (file) {
    let extention = file.substring(file.lastIndexOf('.'))
    if (extention === '.csv') {
        return new csvParser(file);
    }
    if (extention === '.json') {
        return new jsonParser(file);
    }
    if (extention === '.xml') {
        return new xmlParser(file);
    }
    logger.error("Invalid file type" + extension);
    console.log("This is an invalid file type: " + extention);
}

class Parser {

    constructor(file) {
        this.file = file;
        this.validTransactionLines = [];
        this.invalidTransactionLines = [];
        this.lineNum = 0;
        if (!fs.existsSync(file)) {
            logger.warn("Invalid file given");
            console.log("No such file")
            return null;
        }
    }

    async getParsedTransactionLines() {
        await this.parse();
        return this.validTransactionLines;
    }

    async parse() {

    }

    validateLine(line) {
        this.lineNum++;
        if (line.length !== 5) {
            logger.error("Line has " + line.length + " elements insead of 5");
            this.invalidTransactionLines.push([this.lineNum, line]);
            return;
        }

        line[4] = parseFloat(line[4]);
        if (!line[4] && line[4] !== 0) {
            this.invalidTransactionLines.push([this.lineNum, line]);
            return;
        }

        if (!line[0].isValid()) {
            this.invalidTransactionLines.push([this.lineNum, line]);
            return;
        }
        this.validTransactionLines.push(line);
    }

    checkInvalids() {
        if (this.invalidTransactionLines.length > 0) {
            console.log("These invalid lines were ommited, please fix them")
            this.invalidTransactionLines.forEach((l) => {
                console.log(`${l[0]}: ${l[1]}`);
            })
        }
    }
}

class csvParser extends Parser {
    async parse() {
        return new Promise((resolve, reject) => {
            const parser = csv({
                objectMode: true
            }, (err, result) => {
                if (err) {
                    console.error(err);
                    logger.error(err)
                    reject(err);
                } else {
                    result.shift();
                    const transactionLines = [];
                    result.forEach(line => {
                        line[0] = moment(line[0], "DD/MM/YYYY");
                        this.validateLine(line);
                    });
                    resolve(this.validTransactionEntries);
                }
            })

            fs.createReadStream(this.file).pipe(parser);
        })
    }
}

class jsonParser extends Parser {
    async parse() {
        let data = await fs.readFileSync(this.file);
        let parsedJson = JSON.parse(data);
        parsedJson.forEach((transactionObject) => {
            const date = moment(transactionObject.Date);
            const line = [date, transactionObject.FromAccount, transactionObject.ToAccount, transactionObject.Narrative, transactionObject.Amount]
            this.validateLine(line);
        });
    }
}

class xmlParser extends Parser {
    async parse() {
        let options = {
            ignoreAttributes: false,
            attributeNamePrefix: "",
            attrValueProcessor: a => he.decode(a, {
                isAttributeValue: true
            })
        }
        let parsedXml = xmlparse.parse(fs.readFileSync(this.file, "utf8"), options).TransactionList.SupportTransaction;
        parsedXml.forEach((transactionObject) => {
            let date = moment('31/12/1899', "DD/MM/YYYY").add(transactionObject.Date, 'days');
            let line = [date,
                transactionObject.Parties.From,
                transactionObject.Parties.To,
                transactionObject.Description,
                transactionObject.Value
            ];
            this.validateLine(line);
        })

    }
}