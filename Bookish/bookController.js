const { Router } = require('express');
const passport = require('passport');
const database = require('./database');


class BookController {
    constructor() {
        this.router = Router();
        this.router.get('/', passport.authenticate('jwt'), this.getBook.bind(this));
        this.router.post('/', passport.authenticate('jwt'), this.createBook.bind(this));
        this.router.get('/author/', passport.authenticate('jwt'), this.getBooksByAuthor.bind(this));
        this.router.get('/title/', passport.authenticate('jwt'), this.getBooksByTitle.bind(this));
    }

    async getBook(req, res) {
        const result = await database.getBooks();
        res.send(result);
    }

    async createBook(req, res) {
        try {
            const book = await database.getBooksByTitle(req.query.title);
            res.send(book);
        } catch (e) {
            await database.newBook(req.query.title, req.query.ISBN, req.query.copies);
            const book = await database.getBooksByTitle(req.query.title);
            try {
                database.getAuthorByPrimaryKey(req.query.author);
                await database.newAuthorLink(book['Primary'], req.query.author);
                res.send(book);
            } catch (e) {
                res.status(400);
                res.send('No author');
            }
        }
    }

    async getBooksByTitle(req, res) {
        const result = await database.getBooksByTitle(req.query.title);
        res.send(result);
    }


    async getBooksByAuthor(req, res) {
        const result = await database.getBooksByAuthor(req.query.author);
        res.send(result);
    }


}

module.exports = new BookController().router;