const log4js = require('log4js')

const moment = require('moment');
const logger = log4js.getLogger('file');

module.exports = class Transaction {
    constructor(date, to, from, reason, amount){
        this.valid = true;
        logger.info("Parsing date " + date);
        this.date = moment(date, "DD/MM/YYYY");
        if(!this.date.isValid()){ 
            this.valid = false;
            logger.error("Invalid date")
        }
        this.to = to;
        this.from = from;
        this.reason = reason;
        this.amount = parseFloat(amount);
        logger.info("Parsing amount " + amount + " to " + this.amount);
        if(!this.amount && this.amount !== 0) {
            this.valid=false;
            logger.error("Cannot parse amount")
        };
    }

    static createTransactionFromLine(line){
        if(line.length !== 5) logger.error("Line has " + line.length + " elements insead of 5");
        return new Transaction(line[0], line[1], line[2], line[3], line[4]);
    }
}

