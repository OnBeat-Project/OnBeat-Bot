const {
  app,
  socket,
  server,
  client,
  passport
} = require('../../app');

app.use("/", require('./Routers'));
app.use("/dashboard", require('./Routers/dashboard'));

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

const fetch = require('isomorphic-unfetch')
const {
  getData,
  getPreview,
  getTracks,
  getDetails
} = require('spotify-url-info')(fetch);

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
      console.log(guild);
      io.join(guild);
      console.log(io.rooms);
    });
  console.log(io.rooms);
  io.on("musicRequest",
    async (info) => {

      const guild = client.guilds.cache.get(info.guild);
      const channeldb = await client.db.get(`channel_${guild.id}`);
      var query = info.music;
      var track;
      const member = guild.members.cache.get(info.user);
      if (!member.voice.channel) return socket.in(guild.id).emit("error", {
        message: "You are not in a voice channel!"
      });
      if (guild.members.me.voice.channelId && member.voice.channelId !== guild.members.me.voice.channelId) {
        return void socket.in(guild.id).emit("error", {
          message: "You are not in my voice channel!"
        });
      }
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
        };
      }
      const searchResult = await player
      .search(!track.tracks.items[0]?query: track.tracks.items[0].external_urls.spotify, {
        requestedBy: member,
        searchEngine: QueryType.SPOTIFY_SONG || QueryType.SPOTIFY_PLAYLIST
      })
      .catch(() => {});
      const queue = await player.createQueue(guild, {
        metadata: guild.channels.cache.get(channeldb)
      }) || player.getQueue(guild.id);

      try {
        if (!queue.connection) await queue.connect(member.voice.channel);
      } catch(e) {
        void player.deleteQueue(guild.id);
        return console.log(e);
      }
      console.log(searchResult);
      searchResult.playlist ? queue.addTracks(searchResult.tracks): queue.addTrack(searchResult.tracks[0]);
      if (!queue.playing) {await queue.play();}
      queue.setFilters({
        "fadein": true
      });
      socket.in(guild.id).emit("musicQueue", {
        queue,
        track: queue.track
      });
    });
  client.player.on("trackAdd",
    async(queue, track) => {
      io.join(queue.guild.id);
      await client.db.add(`track.${track.title}`, 1);
      console.log(await client.db.get("track"));
      socket.in(queue.guild.id).emit("musicQueue", {
        queue,
        track,
        requestedBy: client.users.cache.get(track.requestedBy.id)
      });
    });
  client.player.on("queueEnd",
    async(queue, track) => {
      socket.in(queue.guild.id).emit("queueEnd", {
        queue, track
      });
    });
  var interval;
  client.player.on("trackStart",
    async(queue, track) => {
      const interaction = queue.metadata;
      const embed = new EmbedBuilder()
      .setTitle("🎵 | Playing")
      .setDescription(`Now playing \`${track.title}\` (\`${track.duration}\`) by \`${track.author}\``)
      .setFooter({
        iconURL: track.requestedBy.displayAvatarURL(), text: `Requested by: ${track.requestedBy.username}`
      })
      .setColor("#202023");

      if (!queue.metadata) return;

      queue.metadata.send({
        embeds: [embed]
      }).then(message => {});
      interval = setInterval(async() => {
        if (!queue.playing) return;
        var perc;
        perc = queue.getPlayerTimestamp();
        const guild = client.guilds.cache.get(queue.guild.id);
        const voiceChannel = guild.channels.cache.get(queue.connection.channel.id);
        // console.log(voiceChannel)
        // const members = voiceChannel.members
        const info = await getPreview(track.url);
        // console.log(interval)
        const lyrics = await client.lyrics.search(`${track.title} ${track.artist}`);
        // console.log(lyrics)
        socket.in(queue.guild.id).emit("currentMusic", {
          queue,
          track,
          perc,
          info,
          voiceChannel,
          lyrics,
          tracks: queue.tracks,
          requestedBy: client.users.cache.get(track.requestedBy.id)
        });
      },
        1000);
    });
  io.on("pauseTrack",
    (info) => {
      const queue = player.getQueue(info.guild);
      if (!queue.playing) return;
      const guild = client.guilds.cache.get(info.guild);
      const member = guild.members.cache.get(info.user);
      if (!member.voice.channel) return socket.in(guild.id).emit("error", {
        message: "You are not in a voice channel!"
      });
      if (guild.members.me.voice.channelId && member.voice.channelId !== guild.members.me.voice.channelId) {
        return void socket.in(guild.id).emit("error", {
          message: "You are not in my voice channel!"
        });
      }
      console.log(info);
      const paused = queue.setPaused(info.paused);
      // console.log(paused)
      socket.in(info.guild).emit("trackUpdate", {
        pause: info.paused
      });
    });
  io.on("skipTrack",
    (info) => {
      const queue = player.getQueue(info.guild);
      if (!queue.playing) return;
      const guild = client.guilds.cache.get(info.guild);
      const member = guild.members.cache.get(info.user);
      if (!member.voice.channel) return socket.in(guild.id).emit("error", {
        message: "You are not in a voice channel!"
      });
      if (guild.members.me.voice.channelId && member.voice.channelId !== guild.members.me.voice.channelId) {
        return void socket.in(guild.id).emit("error", {
          message: "You are not in my voice channel!"
        });
      }
      queue.skip();
    });
  client.player.on("trackEnd",
    (queue, track) => {
      socket.in(queue.guild.id).emit("trackEnd", {
        queue, track
      });
      clearInterval(interval);
    });
  console.log(`connected to ${io.id}`);
});