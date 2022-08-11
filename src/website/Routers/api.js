const express = require('express');
const router = express.Router();

const {
  app,
  server,
  client,
  passport
} = require('../../../app');

router.get("/", (req, res) => {
  res.send({
    Message: "Api is ok"
  });
});

router.get("/guild/:id/queue", (req, res) => {
  let q = client.player.getQueue(req.params.id);
  if (!q || q === undefined || q.length === 0) return res.json(undefined);
  res.json({
    track: q.nowPlaying(),
    tracks: q.tracks,
    playing: q.playing
  });
});

router.get("/guild/:id/queue/progress", (req, res) => {
  let q = client.player.getQueue(req.params.id);
  if (!q || q === undefined || q.length === 0) return res.send(undefined);
  var perc = q.getPlayerTimestamp();
  res.json(perc);
});

router.post("/guild/:id/queue/shuffle", async(req,res) => {
  const guild = client.guilds.cache.get(req.params.id);
  const member = guild.members.cache.get(req.query.user);
  if(!member.voice.channel) return res.json({});
  
  let q = client.player.getQueue(req.params.id);
  if (!q || q === undefined || q.length === 0) return res.json(undefined);
  
  await q.shuffle();
  
  res.json({
    code: "Success"
  });
});

router.post("/guild/:id/track/add", async function (req, res) {
  const player = client.player;
  const body = req.query;
  if (!body) return;

  const guild = client.guilds.cache.get(req.params.id);

  const member = guild.members.cache.get(body.user);

  if(!member.voice.channel) return res.json({
    errCode: 1,
    err: "User aren't in voice channel"
  });
  const queue = player.createQueue(req.params.id, {
    metadata: {
      channel: ""
    },
    spotifyBridge: true,
  });
  try {
    if (!queue.connection) await queue.connect(member.voice.channel);
  } catch(e) {
    queue.destroy();
    console.log(e);
    res.json({
      errCode: 500,
      err: "Internal Server Error"
    });
  }

  const track = await player.search(body.query, {
    requestedBy: member
  }).then(x => x.tracks[0]);

  if (!track) return res.json({
    errCode: 1,
    err: "Not found"
  });

  if (track.playlist) {
    queue.addTracks(track.playlist.tracks);
  } else {
    queue.play(track);
  }
  
  if(!queue.playing) queue.play();
  res.json({
    track
  });
});

router.post("/guild/:id/track/skip/:num", async function(req,res) {
  let queue = client.player.getQueue(req.params.id);
  const guild = client.guilds.cache.get(req.params.id);
  const member = guild.members.cache.get(req.query.user);
  if(!member.voice.channel) return res.json({
    errCode: 1,
    err: "User aren't in voice channel"
  });
  if(!queue) return res.json({
    errCode: 2,
    err: "Nothing playing"
  });
  
  await queue.skipTo(Number(req.params.num));
  res.json({queue});
});

module.exports = router;