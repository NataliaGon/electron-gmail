var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const GMAIL_CLIENT_ID = '9966615901-gi42os2oobnhclrep4qo3nk2d1ng7hmu.apps.googleusercontent.com';
const CLIENT_SECRET = 'y_axlMCVd8tEox7IYnfr0mtL';

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: GMAIL_CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "http://localhost:4000/"
  },
  function(accessToken, refreshToken, profile, done) {
       User.findOrCreate({ googleId: profile.id }, function (err, user) {
        console.log(profile, done);
         return done(err, user);
        
       });
  }
));

