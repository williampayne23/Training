const { Router } = require('express');
const passport = require('passport');

const { Author } = require('./sequelizeSetup');

class AuthorController {
    constructor() {
        this.router = Router();
        this.router.get('/', passport.authenticate('jwt'), this.getAuthors.bind(this));
        this.router.post('/', passport.authenticate('jwt'), this.createAuthor.bind(this));
    }

    async getAuthors(req, res) {
        const result = await Author.findAll();
        res.send(result);
    }

    async createAuthor(req, res) {
        try {
            await Author.create({ 'Name': req.query.name });
            res.send('Created');
        } catch (e) {
            res.status(500);
            res.send(e);
        }
    }
}

module.exports = new AuthorController().router;