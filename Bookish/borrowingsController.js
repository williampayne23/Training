const { Router } = require('express');
const moment = require('moment');
const database = require('./database');
const passport = require('passport');


class BorrowingsController {
    constructor() {
        this.router = Router();
        this.router.get('/', passport.authenticate('jwt'), this.getBooksCheckedOutByUser.bind(this));
        this.router.post('/', passport.authenticate('jwt'), this.checkoutBook.bind(this));
        this.router.patch('/', passport.authenticate('jwt'), this.returnBook.bind(this));
        this.router.put('/', passport.authenticate('jwt'), this.returnBook.bind(this));
    }

    // Get books checked out by user
    async getBooksCheckedOutByUser(req, res) {
        const borrowings = await database.getBorrowingsByUser(req.session.passport.user);
        const bookPromises = [];
        const unfinishedBorrowings = borrowings.filter((borrowing) => borrowing['Return date'] === null);
        unfinishedBorrowings.forEach(borrowing => {
            bookPromises.push(database.getBooksByPrimaryKey(borrowing.Book_FK));
        });
        const books = await Promise.all(bookPromises);
        res.send(books);
    }

    // // Checkout a book Post
    async checkoutBook(req, res) {
        const dueDate = moment().add(1, 'month').format('YYYY-MM-DD');
        let unfinishedBorrowings = [];
        try {
            const borrowings = await database.getBorrowingsByBook(req.query.book);
            unfinishedBorrowings = borrowings.filter((borrowing) => borrowing['Return date'] !== null);
        } catch (e) {
            console.error(e);
        }
        const book = await database.getBooksByPrimaryKey(req.query.book);
        if (book.Copies - unfinishedBorrowings.length > 0) {
            await database.newBorrowing(dueDate, req.session.passport.user, req.query.book);
            res.send('Checked Out');
        } else {
            res.status(400);
            res.send('No Copies Available');
        }
    }


    // // Return a book put/patch
    async returnBook(req, res) {
        try {
            const books = await database.getBorrowingsByUser(req.session.passport.user);
            const borrowing = books.filter(book => {
                return (book['Book_FK'] === Number(req.query.book));
            });
            const date = moment().format('YYYY-MM-DD');
            database.setBorrowingReturnDate(borrowing[0].Primary, date);
            res.send('Returned');
        }
        catch (e) {
            res.status(400);
            res.send('No Borrowings on this account');

        }

    }
}

module.exports = new BorrowingsController().router;
