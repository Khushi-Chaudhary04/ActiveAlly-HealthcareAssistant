const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db'); // Import the database connection

passport.use(new GoogleStrategy({
    clientID: '636751672091-hmhc1khldl8o11u8qv5bpatdc7qc99rr.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback',
},
    (accessToken, refreshToken, profile, done) => {
        // Save user data to the database
        const { displayName, emails } = profile;
        const email = emails[0].value;

        // Check if the user already exists
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                return done(err, null);
            }

            if (results.length === 0) {
                // User does not exist, insert into the database
                const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
                const values = [displayName, email];

                db.query(sql, values, (err) => {
                    if (err) {
                        return done(err, null);
                    }

                    console.log('User data saved to the database');
                    return done(null, profile);
                });
            } else {
                // User already exists, proceed with authentication
                return done(null, profile);
            }
        });
    }));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});