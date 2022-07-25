const http = require('node:http'), express = require('express'), io = require('socket.io'), session = require('express-session'), passport = require('passport'), Strategy = require('passport-discord').Strategy;
const https = require('https');
const fs = require('node:fs');
const Topgg = require("@top-gg/sdk")

const MongoStore = require('connect-mongo');

var bodyParser = require('body-parser')

const client = require('./index.js')
const privateKey = fs.readFileSync(process.env.private, 'utf8');
const certificate = fs.readFileSync(process.env.cert, 'utf8');
const ca = fs.readFileSync(process.env.ca, 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const i18nextMiddleware = require('i18next-http-middleware');

i18next
.use(Backend)
.use(i18nextMiddleware.LanguageDetector)
.init({
  backend: {
    loadPath: __dirname + '/src/translation/{{lng}}/{{ns}}.json'
  },
  fallbackLng: 'en',
  preload: ['en'],
  ns: ['common', '404', '500', 'dashboard']
});

const app = express();
const httpsServer = https.createServer(credentials,app);

const server = http.createServer(app);

app.set("views", __dirname + "/src/website/views")

const socket = io(httpsServer)
socket.listen(server)
server.listen(80)
httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var scopes = ['identify', 'guilds'];
var prompt = 'none'

passport.use(new Strategy({
  clientID: process.env.DISCORD_ID,
  clientSecret: process.env.DISCORD_SECRET,
  callbackURL: process.env.URL+ "/auth/callback",
  scope: scopes,
  prompt: prompt
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    if (profile.guilds == undefined) return done(null, false);
    return done(null, profile);
  });
}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60000 * 60 * 24
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL
  })
}));
app.use(passport.initialize());
app.use(passport.session());

// app.use(i18nextMiddleware.handle(i18next));

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.use(express.static(__dirname + "/public"))

const webhook = new Topgg.Webhook(process.env.TOPGGauth)

app.post("/webhook/topgg", webhook.listener(vote => {
  console.log(vote)
  const user = client.users.cache.get(vote.user)
  if (!user) return;
  console.log(`${user.tag} voted!`)
}))

module.exports = {
  app,
  server,
  socket,
  client,
  passport,
  checkAuth: function (req, res, next) {
    req.session.checkURL = req.originalUrl;
    if (req.isAuthenticated()) return next();
    res.redirect("/auth/callback")
  }
}
require('./src/website');
