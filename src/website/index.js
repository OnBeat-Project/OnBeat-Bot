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
  req.session.backURL = req.originalUrl;
  next();
}

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
