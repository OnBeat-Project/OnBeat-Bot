const {
  app,
  server,
  client,
  passport
} = require('../../app');

app.use("*", (req,res,next) => {
  if(req.hostname === "mars.dnsbox.me") {
    res.render("503.ejs");
  } else {
    next();
  }
});


app.use("/", checkUrl, require('./Routers'));
app.use("/dashboard", checkUrl, require('./Routers/dashboard'));
app.use("/api", require('./Routers/api'));

function checkUrl(req,res,next) {
  req.session.lastURL = req.url;
  next();
}



app.get("/auth/login", passport.authenticate('discord', {}), function(req, res, next) {
  console.log(req.url)
  req.session.lastURL = req.url;
	next();
});

app.get('/auth/callback', passport.authenticate('discord', {
    failureRedirect: '/'}), function(req, res, next) {
      var redirectUrl = '/dashboard';
		if (!req.user) { return res.redirect('/'); }
		req.logIn(req.user, function(err) {
			if (err) { return next(err); }
		});
		res.redirect(req.session.lastURL || redirectUrl);
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
  // console.log(req.user)
  res.json(req.user);
});

app.use(function(req, res, next) {
  res.status(404).render("404.ejs",
    {
      req,
      res
    });
});

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).render("500.ejs",
    {
      req,
      res,
      error: err
    });
});
