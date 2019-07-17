module.exports = class Transaction {
    constructor(date, from, to, reason, amount) {
        this.date = date;
        this.to = to;
        this.from = from;
        this.reason = reason;
        this.amount = amount;
    }
}