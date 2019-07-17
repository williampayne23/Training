const log4js = require('log4js');
const logger = log4js.getLogger('file');

const csv = require('csv-streamify');
const fs = require('fs');
const xmlparse = require('fast-xml-parser');
const he = require('he');

const moment = require('moment');

module.exports = function (file) {
	const extention = file.substring(file.lastIndexOf('.'));
	if (extention === '.csv') {
		return new CSVParser(file);
	}
	if (extention === '.json') {
		return new JSONParser(file);
	}
	if (extention === '.xml') {
		return new XMLParser(file);
	}
	logger.error('Invalid file type' + extention);
	console.log('This is an invalid file type: ' + extention);
};

class Parser {
	constructor(file) {
		this.file = file;
		this.validTransactionLines = [];
		this.invalidTransactionLines = [];
		this.lineNum = 0;
		if (!fs.existsSync(file)) {
			logger.warn('Invalid file given');
			console.log('No such file');
			return null;
		}
	}

	async getParsedTransactionLines() {
		await this.parse();
		return this.validTransactionLines;
	}

	async parse() {
		throw ('Wrong file');
	}

	validateLine(line) {
		this.lineNum++;
		if (line.length !== 5) {
			logger.error('Line has ' + line.length + ' elements insead of 5');
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
			console.log('These invalid lines were ommited, please fix them');
			this.invalidTransactionLines.forEach((l) => {
				console.log(`${l[0]}: ${l[1]}`);
			});
		}
	}
}

class CSVParser extends Parser {
	async parse() {
		return new Promise((resolve, reject) => {
			const parser = csv({
				objectMode: true,
			}, (err, result) => {
				if (err) {
					console.error(err);
					logger.error(err);
					reject(err);
				} else {
					result.shift();
					result.forEach((line) => {
						line[0] = moment(line[0], 'DD/MM/YYYY');
						this.validateLine(line);
					});
					resolve(this.validTransactionEntries);
				}
			});

			fs.createReadStream(this.file).pipe(parser);
		});
	}
}

class JSONParser extends Parser {
	async parse() {
		const data = await fs.readFileSync(this.file);
		const parsedJson = JSON.parse(data);
		parsedJson.forEach((transactionObject) => {
			const date = moment(transactionObject.Date);
			const line = [date, transactionObject.FromAccount, transactionObject.ToAccount, transactionObject.Narrative, transactionObject.Amount];
			this.validateLine(line);
		});
	}
}

class XMLParser extends Parser {
	async parse() {
		const options = {
			ignoreAttributes: false,
			attributeNamePrefix: '',
			attrValueProcessor: (a) => he.decode(a, {
				isAttributeValue: true,
			}),
		};
		const parsedXml = xmlparse.parse(fs.readFileSync(this.file, 'utf8'), options).TransactionList.SupportTransaction;
		parsedXml.forEach((transactionObject) => {
			const date = moment('31/12/1899', 'DD/MM/YYYY').add(transactionObject.Date, 'days');
			const line = [date,
				transactionObject.Parties.From,
				transactionObject.Parties.To,
				transactionObject.Description,
				transactionObject.Value,
			];
			this.validateLine(line);
		});

	}
}
