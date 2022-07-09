const {
  app,
  server,
  socket,
  client,
  passport,
  checkAuth
} = require('../app')

// Login

app.get('/auth/callback',
  passport.authenticate('discord', {
    failureRedirect: '/', prompt: "none"
  }), function(req, res) {
    if(!req.session.checkURL) req.session.checkURL = "/";
    var hour = 3600000
req.session.cookie.expires = new Date(Date.now() + hour)
req.session.cookie.maxAge = hour
    res.redirect(req.session.checkURL)
  }
);
app.get('/auth/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});
app.get('/auth/info', checkAuth, function(req, res) {
  //console.log(req.user)
  res.json(req.user);
});

// Home
app.use("/", require('./Routers'));
app.use("/dashboard", checkAuth, require('./Routers/dashboard'));

// Socket
const fetch = require('isomorphic-unfetch')
const { getData, getPreview, getTracks, getDetails } = require('spotify-url-info')(fetch)

const player = client.player;
const {
  Player,
  QueryType,
  QueueRepeatMode
} = require("discord-player");
socket.sockets.on("connection", async (io) => {
  io.on("create", (guild) => {
    console.log(guild)
    io.join(guild)
  })
   console.log(io.rooms)
  io.on("musicRequest", async (info) => {
    
    const guild = client.guilds.cache.get(info.guild);
    const channeldb = await client.db.get(`channel_${guild.id}`)
    var query = info.music;
    var track;
    const member = guild.members.cache.get(info.user)
    if(!member.voice.channel) return;
    try {
      track = await client.spotify.search({ type: 'track', query: query});
    } catch(e) {
      track = {
        tracks: {
          items: []
        }
      }
    }
     // console.log()
    const searchResult = await player
    .search(track.tracks.items[0]?track.tracks.items[0].external_urls.spotify:query, {
      requestedBy: member,
      searchEngine: QueryType.SPOTIFY_SONG
    })
    .catch(() => {});
    
    const queue = await player.createQueue(guild, {
      metadata: guild.channels.cache.get( channeldb)
    });
    
    try {
      if (!queue.connection) await queue.connect(member.voice.channel);
    } catch(e) {
      void player.deleteQueue(guild.id);
      return console.log(e)
      }
      searchResult.playlist ? queue.addTracks(searchResult.tracks): queue.addTrack(searchResult.tracks[0]);
     if (!queue.playing) await queue.play();
     socket.emit("musicQueue", {
       queue
     })
  })
  client.player.on("trackAdd", async(queue, track) => {
    socket.emit("musicQueue", {
       queue,
       track
     })
  });
  client.player.on("queueEnd", async(queue,track) => {
    socket.emit("queueEnd", {queue, track})
  })
  var interval;
  client.player.on("trackStart", async(queue,track) => {
    interval = setInterval(async() => {
    var perc;
     perc = queue.getPlayerTimestamp();

    const info = await getPreview(track.url)
   // console.log(interval)
    socket.emit("currentMusic", {
       queue,
       track,
       perc,
       info
     })
    },1000)
  });
  client.player.on("trackEnd", () => {
    clearInterval(interval)
  })
  console.log(`connected to ${io.id}`)
})