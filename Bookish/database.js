var pgp = require('pg-promise')(/* options */);
var config = require('./config');
const cn = {
    host: 'localhost', // 'localhost' is the default;
    port: 5432, // 5432 is the default;
    database: 'Bookish',
    user: 'postgres',
    password: config.password
};
// You can check for all default values in:
// https://github.com/brianc/node-postgres/blob/master/lib/defaults.js

const db = pgp(cn); // database instance;




module.exports = {

    getBooks() {
        return db.any('SELECT * FROM public.books');
    },

    newBook(title, ISBN, copies) {
        return db.none('INSERT INTO public.books("Title", "ISBN", "Copies") VALUES($1, $2, $3); ', [title, ISBN, copies]);
    },

    deleteBook(PK) {
        return db.none('DELETE FROM public.books WHERE "Primary" = $1;', [PK]);
    },

    updateBookCopies(copies, PK) {
        return db.none('UPDATE public.books SET "Copies"=$1 WHERE "Primary" = $2;', [copies, PK]);
    },

    getBooksByTitle(title) {
        return db.one('SELECT * FROM public.books WHERE "Title"= $1;', [title]);
    },

    getBooksByPrimaryKey(PK) {
        return db.one('SELECT * FROM public.books WHERE "Primary"= $1;', [PK]);
    },

    getAuthors() {
        return db.any('SELECT * FROM public.authors');
    },

    newAuthor(name) {
        return db.none('INSERT INTO public.authors("Name") VALUES($1); ', [name]);
    },

    getAuthorByPrimaryKey(PK) {
        return db.one('SELECT * FROM public.authors WHERE "Primary"= $1;', [PK]);
    },

    getAuthorLink() {
        return db.any('SELECT * FROM public.authorlink');
    },

    newAuthorLink(book_key, author_key) {
        return db.none('INSERT INTO public.authorlink("Book", "Author") VALUES($1, $2); ', [book_key, author_key]);
    },

    async getBooksByAuthor(author_key) {
        const links = await db.any('SELECT * FROM public.authorlink WHERE "Author" = $1', [author_key]);
        const books = [];
        await links.forEach(async link => {
            const linkBooks = db.one('SELECT * FROM public.books WHERE "Primary" = $1', [link.Book]);
            books.push(linkBooks);
        });
        return await Promise.all(books);
    },

    newUser(user_name, password) {
        return db.none('INSERT INTO public.user("User_name", "Password") VALUES($1, $2); ', [user_name, password]);
    },

    async getLogin(user_name, password) {
        return await db.one('SELECT * FROM public.user WHERE "User_name"= $1 AND "Password"= $2;', [user_name, password]);
    },

    newBorrowing(dueDate, userFK, bookFK) {
        return db.none('INSERT INTO public.borrowing("Due date", "User_FK", "Book_FK") VALUES($1, $2, $3);', [dueDate, userFK, bookFK]);
    },

    getBorrowingsByBook(bookFK) {
        return db.any('SELECT * FROM public.borrowing WHERE "Book_FK"= $1;', [bookFK]);
    },

    getBorrowingsByUser(UserFK) {
        return db.any('SELECT * FROM public.borrowing WHERE "User_FK"= $1;', [UserFK]);
    },

    setBorrowingReturnDate(PK, date) {
        return db.none('UPDATE public.borrowing SET "Return date"=$1 WHERE "Primary" = $2;', [date, PK]);
    }


};