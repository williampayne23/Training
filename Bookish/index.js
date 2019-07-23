const express = require('express');
const database = require('./database');
const moment = require('moment');

const app = express();

app.listen(3000);



// Login Get
app.get('/login/', async function (req, res) {
    const result = await database.getLogin(req.query.username, req.query.password);
    res.send(result);
});

// Make account Post
app.post('/login/', async function (req, res) {
    const result = await database.newUser(req.query.username, req.query.password);
    res.send(result);
});

// Get books checked out by user
app.get('/account/books/', async function (req, res) {
    const borrowings = await database.getBorrowingsByUser(req.query.user);
    const bookPromises = [];
    const unfinishedBorrowings = borrowings.filter((borrowing) => borrowing['Return date'] === null);
    console.log(unfinishedBorrowings);
    unfinishedBorrowings.forEach(borrowing => {
        bookPromises.push(database.getBooksByPrimaryKey(borrowing.Book_FK));
    });
    const books = await Promise.all(bookPromises);
    res.send(books);
});

// // Checkout a book Post
app.post('/book/checkout', async function (req, res) {
    const dueDate = moment().add(1, 'month').format('YYYY-MM-DD');
    let unfinishedBorrowings = [];
    try {
        const borrowings = await database.getBorrowingsByBook(req.query.BookFK);
        unfinishedBorrowings = borrowings.filter((borrowing) => borrowing['Return date'] !== null);
    } catch (e) {
        console.error(e);
    }
    const book = await database.getBooksByPrimaryKey(req.query.BookFK);
    console.log(book.Copies);
    console.log(unfinishedBorrowings);
    if (book.Copies - unfinishedBorrowings.length > 0) {
        const result = await database.newBorrowing(dueDate, req.query.userFK, req.query.BookFK);
        res.send(result);
    } else {
        res.status(400);
        res.send('No Copies Available');
    }
});


// // Return a book put/patch

// // Get all the books in the library
app.get('/books/', async function (req, res) {
    const result = await database.getBooks();
    res.send(result);
});

// // Get all the authors in the library
app.get('/author/', async function (req, res) {
    const result = await database.getAuthors();
    res.send(result);
});

// // Get books by title
app.get('/books/title/', async function (req, res) {
    const result = await database.getBooksByTitle(req.query.title);
    res.send(result);
});

// // Get books by author
app.get('/books/author/', async function (req, res) {
    const result = await database.getBooksByAuthor(req.query.author);
    res.send(result);
});

// // Add new book Post
app.post('/books/', async function (req, res) {
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
            res.send('No');
        }
    }

});

// app.get('/', function (req, res) {
//     res.send('hello world');
// });

