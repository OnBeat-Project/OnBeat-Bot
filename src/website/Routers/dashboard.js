const express = require('express');
const router = express.Router();

const {
  app,
  server,
  client,
  passport
} = require('../../../app')

const stringTools = require('string-toolkit');

router.get("/", (req, res) => {
  res.render("dashboard/index.ejs", {cli: client,req,res, stringTools});
}).get("/guild/:id", async(req,res) => {
  const guild = client.guilds.cache.get(req.params.id);
  res.render("dashboard/guild.ejs", {cli: client,req,res,guild,stringTools,player:client.player});
});

module.exports = router;