const express = require('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const BookRoutes = require('./src/Controllers/bookController');
const BorrowingRoutes = require('./src/Controllers/borrowingsController');
const AuthorRoutes = require('./src/Controllers/authorController');
const UserRoutes = require('./src/Controllers/userController');

const app = express();


var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';
passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    return done(null, jwt_payload.data);
}));


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (id, done) {
    done(null, id);
});


app.use(passport.initialize());
app.use(passport.session());

app.use('/books', BookRoutes);
app.use('/borrowings', BorrowingRoutes);
app.use('/authors', AuthorRoutes);
app.use('/account', UserRoutes);



app.listen(3000);