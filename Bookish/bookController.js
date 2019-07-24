const { Router } = require('express');
const passport = require('passport');

const { Book, Author, AuthorLink } = require('./sequelizeSetup');

class BookController {
    constructor() {
        this.router = Router();
        this.router.get('/', passport.authenticate('jwt'), this.getBook.bind(this));
        this.router.post('/', passport.authenticate('jwt'), this.createBook.bind(this));
        this.router.get('/author/', passport.authenticate('jwt'), this.getBooksByAuthor.bind(this));
        this.router.get('/title/', passport.authenticate('jwt'), this.getBooksByTitle.bind(this));
    }

    async getBook(req, res) {
        const result = await Book.findAll();
        res.send(result);
    }

    async createBook(req, res) {
        const authorResult = await Author.findOne({ where: { id: req.query.author } });
        const author = authorResult.dataValues;
        if (author) {
            const bookResult = await Book.findOrCreate({
                where: {
                    Title: req.query.title,
                    ISBN: req.query.ISBN,
                    Copies: req.query.copies
                }
            });
            const book = bookResult[0].dataValues;
            AuthorLink.create({ Author: author.id, Book: book.id });
            res.send('Created');
        }
        else {
            res.status(400);
            res.send('Failed');
        }
    }

    async getBooksByTitle(req, res) {
        const result = await Book.findAll({ where: { Title: req.query.title } });
        res.send(result);
    }


    async getBooksByAuthor(req, res) {
        const result = await Author.findOne({ where: { Name: req.query.author } });
        if (result) {
            const links = await AuthorLink.findAll({ where: { Author: result.id }, include: { model: Book } });
            res.send(links);
        } else {
            res.status(404);
            res.send('No such author');
        }
    }
}

module.exports = new BookController().router;