var GS = unsafeWindow.GS;

self.port.on("play", function () {
  if(GS.player.isPaused) {
    GS.player.resumeSong();
  } else {
    GS.player.playSong();
  }
});
self.port.on("pause", function () {
  GS.player.pauseSong();
});
self.port.on("next", function () {
  GS.player.nextSong();
});
self.port.on("previous", function () {
  GS.player.previousSong();
});

try{
  function unloadListener(e){
    self.port.emit("unload");
    return true;
  }

  //flag to know when to tap the communication between the UI and the player
  var wireTapped = false;

  function nowPlayingListener(song){
    if(song.ArtistName) {
      self.port.emit("nowPlaying", {"song":song, "notify": true});
      if (!wireTapped) {
        // Take care that this JS string is going to be evaluated in document
        // scope, so it doesn't have access to content scripts functions.
        // Except if we explicitely expose one, like gs_ff_plugin_progressListener
        GS.player.player.setPlaybackStatusCallback(
          "function(b){GS.Controllers.PlayerController.instance().playerStatus(b); gs_ff_plugin_progressListener(b);}"
        );
        wireTapped = true;
      }
    }
  }

  function stoppedListener(song){
    self.port.emit("stopped", {"songsQueued":song.AlbumID > 0});
  }

  // Expose this function to document scope as we register it before with
  // `setPlaybackStatusCallback`
  unsafeWindow.gs_ff_plugin_progressListener = function progressListener(event){
    self.port.emit("songProgress", {
      "position": Math.ceil(event.position/event.duration*100),
      "buffered": Math.ceil(event.bytesLoaded/event.bytesTotal*100)
    });
  }

  function playingListener(event){
      self.port.emit("nowPlaying", {"song":event.activeSong, "notify": false});
  }

  var jQuery = unsafeWindow.jQuery;
  jQuery(unsafeWindow).unload(unloadListener);
  jQuery.subscribe("gs.player.nowplaying", nowPlayingListener);
  jQuery.subscribe("gs.player.playing", playingListener);
  jQuery.subscribe("gs.player.stopped", stoppedListener);

} catch(e) { };
