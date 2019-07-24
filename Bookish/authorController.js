const { Router } = require('express');
const database = require('./database');
const passport = require('passport');


class AuthorController {
    constructor() {
        this.router = Router();
        this.router.get('/', passport.authenticate('jwt'), this.getAuthors.bind(this));
        this.router.post('/', passport.authenticate('jwt'), this.createAuthor.bind(this));
    }

    async getAuthors(req, res) {
        const result = await database.getAuthors();
        res.send(result);
    }

    async createAuthor(req, res) {
        try {
            database.newAuthor(req.query.author);
            res.send('Created');
        } catch (e) {
            res.status(500);
            res.send('Failed');
        }
    }

}

module.exports = new AuthorController().router;