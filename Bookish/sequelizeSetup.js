const Sequelize = require('sequelize');

var config = require('./config');

const sequelize = new Sequelize('Bookish', 'postgres', config.password, {
    host: 'localhost',
    dialect: 'postgres'
});

const Author = sequelize.define('authors', {
    // attributes
    Name: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

const Book = sequelize.define('books', {
    // attributes
    Title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ISBN: {
        type: Sequelize.STRING,
        unique: true
    },
    Copies: {
        type: Sequelize.INTEGER
    }
}, {
    timestamps: false
});


const AuthorLink = sequelize.define('authorlink', {
}, {
    timestamps: false
});

AuthorLink.belongsTo(Author, {
    foreignKey: 'Author',
    constraints: true
});

AuthorLink.belongsTo(Book, {
    foreignKey: 'Book',
    constraints: true
});

const User = sequelize.define('user', {
    // attributes
    User_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    Password: {
        type: Sequelize.STRING,
    }
}, {
    timestamps: false
});

const Borrowing = sequelize.define('borrowing', {
    // attributes
    Due_date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    Return_date: {
        type: Sequelize.DATE,
    },
}, {
    timestamps: false
});

Borrowing.belongsTo(User, {
    foreignKey: 'User',
    constraints: true
});

Borrowing.belongsTo(Book, {
    foreignKey: 'Book',
    constraints: true
});

module.exports = {
    Author,
    Book,
    AuthorLink,
    Borrowing,
    User
};