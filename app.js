const http = require('node:http');
const express = require('express');
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
const url = require("url");
const path = require("node:path");
const cors = require('cors')


app.use(cors({
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
}))

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
  ns: ['common', '404', '500', 'dashboard','util']
});

app.use(i18nextMiddleware.handle(i18next));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

module.exports = {
  express,
  app,
  server,
  i18next,
  client,
  passport
};
require('./src/website/index.js');
server.listen(80, () => {
  console.log("Running on port 80");
});
