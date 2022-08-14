const {
  app,
  server,
  client,
  passport
} = require('../../app');

app.use("/", require('./Routers'));
app.use("/dashboard", require('./Routers/dashboard'));
app.use("/api", require('./Routers/api'));

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
