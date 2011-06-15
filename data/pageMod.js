var GS = unsafeWindow.GS;

onMessage = function onMessage(action) {
  try{
    switch(action) {
      case "play":
        if(GS.player.isPaused) {
          GS.player.resumeSong();
        } else {
          GS.player.playSong();
        }
        break
      case "pause":
        GS.player.pauseSong();
        break
      case "next":
        GS.player.nextSong();
        break
      case "previous":
        GS.player.previousSong();
        break
    }
  } catch (e) {
    //console.log('GS not ready');
  }
};

try{
  function unloadListener(e){
    postMessage({"action":"unload"});
    return true;
  }

  //flag to know when to tap the communication between the UI and the player
  var wireTapped = false;

  function nowPlayingListener(song){
    if(song.ArtistName) {
      postMessage({"action":"nowPlaying", "song":song, "notify": true});
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
    postMessage({"action":"stopped", "songsQueued":song.AlbumID > 0})
  }

  // Expose this function to document scope as we register it before with
  // `setPlaybackStatusCallback`
  unsafeWindow.gs_ff_plugin_progressListener = function progressListener(event){
    postMessage({
      "action":"songProgress",
      "position": Math.ceil(event.position/event.duration*100),
      "buffered": Math.ceil(event.bytesLoaded/event.bytesTotal*100)
    });
  }

  function playingListener(event){
      postMessage({"action":"nowPlaying", "song":event.activeSong, "notify": false});
  }

  var jQuery = unsafeWindow.jQuery;
  jQuery(unsafeWindow).unload(unloadListener);
  jQuery.subscribe("gs.player.nowplaying", nowPlayingListener);
  jQuery.subscribe("gs.player.playing", playingListener);
  jQuery.subscribe("gs.player.stopped", stoppedListener);

} catch(e) { };
