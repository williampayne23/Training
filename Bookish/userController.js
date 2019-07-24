const { Router } = require('express');
const database = require('./database');
const jwt = require('jsonwebtoken');


class UserController {
    constructor() {
        this.router = Router();
        this.router.get('/', this.login.bind(this));
        this.router.post('/', this.createAccount.bind(this));
    }


    async login(req, res) {
        const result = await database.getLogin(req.query.username, req.query.password);
        res.send(jwt.sign({ data: result.Primary }, 'secret'));
        res.send(result);
    }

    async createAccount(req, res) {
        await database.newUser(req.query.username, req.query.password);
        const result = await database.getLogin(req.query.username, req.query.password);
        res.send(jwt.sign({ data: result.Primary }, 'secret'));
        res.send(result);
    }

}


module.exports = new UserController().router;