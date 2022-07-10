const {
  app,
  server,
  socket,
  client,
  passport,
  checkAuth
} = require('../app')

const RPC = require('discord-rpc')

// const rpcClient = new RPC.Client({ transport: 'ipc' })


// Login

app.get('/auth/callback',
  passport.authenticate('discord', {
    failureRedirect: '/'
  }), function(req, res) {
    if (!req.session.checkURL) req.session.checkURL = "/";
    var hour = 3600000
    req.session.cookie.expires = new Date(Date.now() + hour)
    req.session.cookie.maxAge = hour
    res.redirect(req.session.checkURL)
  }
);
app.post('/auth/logout', function(req, res) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});
app.get('/auth/info', checkAuth, function(req, res) {
  //console.log(req.user)
  res.json(req.user);
});

// Home
app.use("/", require('./Routers'));
app.use("/dashboard", checkAuth, require('./Routers/dashboard'));

// Set errors
app.use(function(req, res, next) {
  res.render("404.ejs",
    {
      req,
      res
    });
  res.sendStatus(404)
})

app.use(function(err, req, res, next) {
  res.render("500.ejs",
    {
      req,
      res,
      error: err
    });
  res.sendStatus(500)
})

// Socket
const fetch = require('isomorphic-unfetch')
const {
  getData, getPreview, getTracks, getDetails
} = require('spotify-url-info')(fetch)

const player = client.player;
const {
  Player,
  QueryType,
  QueueRepeatMode
} = require("discord-player");
socket.on("connection", async (io) => {
  io.on("create",
    (guild) => {
      // io.set('room', guild, function() {});
      console.log(guild)
      io.join(guild)
      console.log(io.rooms)
    })

  io.on("musicRequest",
    async (info) => {

      const guild = client.guilds.cache.get(info.guild);
      const channeldb = await client.db.get(`channel_${guild.id}`)
      var query = info.music;
      var track;
      const member = guild.members.cache.get(info.user)
      if (!member.voice.channel) return;
      try {
        track = await client.spotify.search({
          type: "track", query: query
        });
      } catch(e) {
        // console.log(e)
        track = {
          tracks: {
            items: []
          }
        }
      }
      console.log(track.tracks.items)
      const searchResult = await player
      .search(track.tracks.items === []?query: track.tracks.items[0].external_urls.spotify, {
        requestedBy: member,
        searchEngine: QueryType.SPOTIFY_SONG
      })
      .catch(() => {});
      const queue = await player.createQueue(guild, {
        metadata: guild.channels.cache.get(channeldb)
      });

      try {
        if (!queue.connection) await queue.connect(member.voice.channel);
      } catch(e) {
        void player.deleteQueue(guild.id);
        return console.log(e)
      }
      searchResult.playlist ? queue.addTracks(searchResult.tracks): queue.addTrack(searchResult.tracks[0]);
      if (!queue.playing) await queue.play();
      socket.in(guild.id).emit("musicQueue", {
        queue,
        track: queue.track
      })
    })
  client.player.on("trackAdd",
    async(queue, track) => {
      socket.in(queue.guild.id).emit("musicQueue", {
        queue,
        track
      })
    });
  client.player.on("queueEnd",
    async(queue, track) => {
      socket.in(queue.guild.id).emit("queueEnd", {
        queue, track
      })
    })
  var interval;
  client.player.on("trackStart",
    async(queue, track) => {
      interval = setInterval(async() => {
        var perc;
        perc = queue.getPlayerTimestamp();
        //const guild = client.guilds.cache.get(queue.guild);
        const voiceChannel = queue.guild.channels.cache.filter(c => c.type === "GUILD_VOICE").get(queue.connection.channel.id)
        const members = voiceChannel.members;
        const info = await getPreview(track.url)
        // console.log(interval)
        socket.in(queue.guild.id).emit("currentMusic", {
          queue,
          track,
          perc,
          info,
          voiceChannel,
          members
        })
      }, 1000)
    });
  io.on("pauseTrack",
    (info) => {
      const queue = player.getQueue(info.guild);
      if (!queue.playing) return;
      console.log(info)
      const paused = queue.setPaused(info.paused);
      // console.log(paused)
      socket.in(info.guild).emit("trackUpdate", {
        pause: info.paused
      });
    })
  io.on("skipTrack",
    (info) => {
      const queue = player.getQueue(info.guild);
      if (!queue.playing) return;
      queue.skip();
    })
  client.player.on("trackEnd",
    () => {
      socket.in(queue.guild.id).emit("trackEnd", {
        queue, track
      })
      clearInterval(interval)
    })
  console.log(`connected to ${io.id}`)
})