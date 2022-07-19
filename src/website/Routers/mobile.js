const express = require('express');
const router = express.Router();

const {
  app,
  server,
  socket,
  client,
  passport,
  checkAuth
} = require('../../../app')

const stringTools = require('string-toolkit');

router.get("/dashboard", (req, res) => {
  res.render("MobileView/index.ejs", {cli: client,req,res, stringTools})
}).post("/dashboard/guild", async(req,res) => {
  const guild = client.guilds.cache.get(req.body.guild);
  res.render("MobileView/guild.ejs", {cli: client,req,res,guild,stringTools,player:client.player,channeldb:await client.db.get(`channel_${guild.id}`)})
})

module.exports = router;