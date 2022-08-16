const express = require('express');
const router = express.Router();

const {
  app,
  server,
  client,
  passport
} = require('../../../app');

router.use("*", (req, res, next) => {
  if (req.hostname == "api.onbeat.me") {
    next();
  } else {
    next();
  }
});

router.get("/", (req, res) => {
  if (req.hostname == "api.onbeat.me") {
    res.send({
      api: "OnBeat"
    });
  }
});

router.get("/guild/:id/queue", async function(req, res) {
  let q = client.player.getQueue(req.params.id);
  const member = client.guilds.cache.get(req.params.id).members.cache.get(req.user?req.user.id:"")?client.guilds.cache.get(req.params.id).members.cache.get(req.user?req.user.id:""):null;
  const botMember = client.guilds.cache.get(req.params.id).me?client.guilds.cache.get(req.params.id).me:null;
   try {
    res.json({
      track: q?q.nowPlaying():false,
      tracks: q?q.tracks:[],
      paused: q?q.connection.paused:true,
      playing: q?q.playing:false,
      memberVoiceChannel: member.voice.channel?member.voice.channel:null,
      botVoiceChannel: botMember.voice.channel?botMember.voice.channel:null
    });
   } catch(e) {
     console.error(e);
     res.json({
      tracks: q?q.tracks:[],
    });
   }
});

router.get("/guild/:id/queue/progress", (req, res) => {
  let q = client.player.getQueue(req.params.id);
  var perc = q?q.getPlayerTimestamp():{};
  res.json(perc);
});

router.post("/guild/:id/queue/shuffle", async(req,res) => {
  const guild = client.guilds.cache.get(req.params.id);
  const member = guild.members.cache.get(req.query.user);
  if(!member.voice.channel) return res.json({
    errCode: 1,
    err: "User aren't in voice channel"
  });
  
  let q = client.player.getQueue(req.params.id);
  if (!q || q === undefined || q.length === 0) return res.json({ errCode: 2, err: "Nothing playing" });
  
  await q.shuffle();
  
  res.json({
    code: "Success"
  });
});

router.post("/guild/:id/queue/clear", async(req,res) => {
  const guild = client.guilds.cache.get(req.params.id);
  const member = guild.members.cache.get(req.query.user);
  if(!member.voice.channel) return res.json({
    errCode: 1,
    err: "User aren't in voice channel"
  });
  
  let q = client.player.getQueue(req.params.id);
  if (!q || q === undefined || q.length === 0) return res.json({ errCode: 2, err: "Nothing playing" });
  
  await q.destroy();
  
  res.json({
    code: "Success"
  });
});

router.post("/guild/:id/track/add", async function (req, res) {
  const player = client.player;
  const body = req.query;
  //const body = req.user
  if (!body) return;

  const guild = client.guilds.cache.get(req.params.id);

  const member = guild.members.cache.get(body.user);

  if(!member.voice.channel) return res.json({
    errCode: 1,
    err: "User aren't in voice channel"
  });
  const queue = player.createQueue(req.params.id, {
    metadata: {
      
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

router.post("/guild/:id/queue/skip/:num", async function(req,res) {
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
  
  const num = Number(req.params.num);
  
   await queue.skipTo(Number(req.params.num));
  res.json({queue});
});

router.post("/guild/:id/track/skip", async function(req,res) {
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
  
 // const num = Number(req.params.num);
  
   await queue.skip();
  res.json({queue});
});

router.post("/guild/:id/track/pause", async function(req,res) {
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
  console.log(queue.connection.paused);
  if(!queue.connection.paused) { await queue.setPaused(true) } else { await queue.setPaused(false); }
  
  res.json({queue});
});

module.exports = router;
