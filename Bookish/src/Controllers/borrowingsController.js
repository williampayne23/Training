const { Router } = require('express');
const moment = require('moment');
const passport = require('passport');
const { Borrowing, Book } = require('../models');


class BorrowingsController {
    constructor() {
        this.router = Router();
        this.router.get('/', passport.authenticate('jwt'), this.getBooksCheckedOutByUser.bind(this));
        this.router.post('/', passport.authenticate('jwt'), this.checkoutBook.bind(this));
        this.router.patch('/', passport.authenticate('jwt'), this.returnBook.bind(this));
    }

    async getBooksCheckedOutByUser(req, res) {
        const borrowings = await Borrowing.findAll({ where: { User: req.session.passport.user, Return_date: null }, include: { model: Book } });
        if (borrowings.length > 0) {
            res.send(borrowings);
        } else {
            res.status(400);
            res.send('No borrowings on this account');
        }
    }

    async checkoutBook(req, res) {
        const dueDate = moment().add(1, 'month').format('YYYY-MM-DD');
        const borrowings = await Borrowing.findAll({ where: { Book: req.query.book, Return_date: null } });
        const number_of_borrowings = borrowings.length;
        const book = await Book.findOne({ where: { id: req.query.book } });
        if (book === null) {
            res.status(404);
            res.send('No such book');
            return;
        }
        const copies = book.Copies;
        if (copies >= number_of_borrowings) {
            Borrowing.create({ Due_date: dueDate, User: req.session.passport.user, Book: req.query.book });
            res.send('Book checked out.');
        }
        else {
            res.status(400);
            res.send('Not enough copies.');
        }
    }

    async returnBook(req, res) {
        const borrowing = await Borrowing.findOne({ where: { Book: req.query.book, User: req.session.passport.user, Return_date: null } });
        if (borrowing) {
            const result = await borrowing.update({
                Return_date: moment()
            });
            res.send(result);
        } else {
            res.status(400);
            res.send('No borrowing for this book');
        }
    }
}

module.exports = new BorrowingsController().router;
