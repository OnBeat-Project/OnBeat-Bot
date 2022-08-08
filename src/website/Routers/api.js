const express = require('express');
const router = express.Router();

const {
  app,
  socket,
  server,
  client,
  passport
} = require('../../../app');

router.get("/", (req, res) => {
  res.sendStatus(200);
});

router.get("/guild/:id/queue", (req, res) => {
  let q = client.player.getQueue(req.params.id);
  if (!q || q === undefined || q.length === 0) return res.json(undefined);
  res.json({
    track: q.nowPlaying(),
    tracks: q.tracks
  });
});

router.get("/guild/:id/queue/progress", (req, res) => {
  let q = client.player.getQueue(req.params.id);
  if (!q || q === undefined || q.length === 0) return res.send(undefined);
  var perc = q.getPlayerTimestamp();
  res.json(perc);
});

router.post("/guild/:id/track/add", async function (req, res) {
  const player = client.player;
  const body = req.query;
  console.log(body);
  if (!body) return;

  const guild = client.guilds.cache.get(req.params.id);

  const member = guild.members.cache.get(body.user);

  const queue = player.createQueue(req.params.id, {
    metadata: {
      channel: ""
    }
  });
  try {
    if (!queue.connection) await queue.connect(member.voice.channel);
  } catch(e) {
    queue.destroy();
    console.log(e);
    res.json({});
  }

  const track = await player.search(body.query, {
    requestedBy: member
  }).then(x => x.tracks[0]);
  
  if (!track) return res.json({});
  
  queue.play(track);
  res.json({
    track
  });
});

module.exports = router;