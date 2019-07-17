module.exports = class User {
    constructor(name) {
        this.username = name;
        this.transactions = [];
        this.runningTotal = 0;
    }

    addToTransaction(transaction) {
        this.runningTotal = this.runningTotal + transaction.amount;
        this.transactions.push(transaction);
    }

    addFromTransaction(transaction) {
        this.runningTotal -= transaction.amount;
        this.transactions.push(transaction);
    }

    toString() {
        if (this.runningTotal > 0) {
            return `${this.username} is owed £${this.runningTotal.toFixed(2)}`;
        }
        if (this.runningTotal < 0) {
            return `${this.username} owes £${-this.runningTotal.toFixed(2)}`;
        }

        return `${this.username} is completely even`;
    }

    getCompleteSummary() {
        let summary = [];
        this.transactions.sort((a, b) => a.date - b.date);
        this.transactions.forEach((t) => {
            if (t.to === this.username) {
                summary.push(`On ${t.date.format("MMMM Do YYYY")} ${t.from} lent ${t.amount} for ${t.reason}`);
            } else {
                summary.push(`On ${t.date.format("MMMM Do YYYY")} ${t.to} borrowed ${t.amount} for ${t.reason}`);
            }
        })
        return summary;
    }
}