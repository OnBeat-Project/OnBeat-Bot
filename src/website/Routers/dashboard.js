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

router.get("/", (req, res) => {
  res.render("dashboard/index.ejs", {cli: client,req,res, stringTools})
}).post("/", async(req,res) => {
  const guild = client.guilds.cache.get(req.body.guild);
  res.render("dashboard/guild.ejs", {cli: client,req,res,guild,stringTools,player:client.player,channeldb:await client.db.get(`channel_${guild.id}`)})
})

module.exports = router;