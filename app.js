const http = require('node:http');
const express = require('express');
const io = require('socket.io');
const bodyParser = require('body-parser');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const i18nextMiddleware = require('i18next-http-middleware');
const fs = require('node:fs');
const https = require('https');


const app = express();
const server = http.createServer(app);
const client = require('./index.js');
const socket = new io.Server(server);
/*const privateKey = fs.readFileSync(process.env.private, 'utf8');
const certificate = fs.readFileSync(process.env.cert, 'utf8');
const ca = fs.readFileSync(process.env.ca, 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};
const httpsServer = https.createServer(credentials,app);
*/

// socket.listen(httpsServer);


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

const scopes = ['identify', 'guilds'];

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_ID,
  clientSecret: process.env.DISCORD_SECRET,
  callbackURL: process.env.URL + '/auth/callback',
  scope: scopes
}, async function(accessToken, refreshToken, profile, done) {
  process.nextTick(() => {
    return done(null, profile);
  });
}));

app.set("views", __dirname + "/src/website/views");


app.use(passport.initialize());
app.use(passport.session());

i18next
.use(Backend)
.use(i18nextMiddleware.LanguageDetector)
.init({
  backend: {
    loadPath: __dirname + '/src/Translation/Website/{{lng}}/{{ns}}.json'
  },
  fallbackLng: 'en',
  preload: ['en'],
  ns: ['common', '404', '500', 'dashboard']
});
app.use(i18nextMiddleware.handle(i18next));

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));


app.get('/auth/callback', passport.authenticate('discord', {
    failureRedirect: '/'}), function(req, res, next) {
      console.log(req.user);
      req.logIn(req.user, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect('/');
      });
      // res.redirect(req.session.checkURL)
});
    
app.post('/auth/logout', function(req, res) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});
app.get('/auth/info', function(req, res) {
  //console.log(req.user)
  res.json(req.user);
});

module.exports = {
  express,
  app,
  server,
  socket,
  io,
  i18next,
  client,
  passport
};

server.listen(80, () => {
  console.log("Running on port 80");
});
/*httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});*/

require('./src/website/index.js');
