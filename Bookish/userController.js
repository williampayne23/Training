const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('./sequelizeSetup');


class UserController {
    constructor() {
        this.router = Router();
        this.router.get('/', this.login.bind(this));
        this.router.post('/', this.createAccount.bind(this));
    }


    async login(req, res) {
        const result = await User.findOne({ where: { User_name: req.query.user, Password: req.query.password } });
        if (result != null) {
            res.send(jwt.sign({ data: result.id }, 'secret'));
        }
        else {
            res.send('Failed Login');
        }
    }

    async createAccount(req, res) {
        const result = await User.findOrCreate({
            where: {
                User_name: req.query.user,
                Password: req.query.password
            }
        });
        if (result != null) {
            res.send(jwt.sign({ data: result.id }, 'secret'));
        }
        else {
            res.send('Failed Login');
        }
    }
}


module.exports = new UserController().router;