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
  window.unloadListener = function(e){
    postMessage({"action":"unload"});
    return true;
  }
  
  //flag to know when to tap the communication between the UI and the player
  var wireTapped = false;
  
  window.nowPlayingListener = function(song){
    if(song.ArtistName) {
      postMessage({"action":"nowPlaying", "song":song, "notify": true});
      if (!wireTapped) {
        GS.player.player.setPlaybackStatusCallback(
          "function(b){GS.Controllers.PlayerController.instance().playerStatus(b); progressListener(b);}"
        );
        wireTapped = true;
      }
    }
  }
  
  window.stoppedListener = function(song){
    postMessage({"action":"stopped", "songsQueued":song.AlbumID > 0})
  }
  
  window.progressListener = function(event){
    postMessage({
      "action":"songProgress",
      "position": Math.ceil(event.position/event.duration*100),
      "buffered": Math.ceil(event.bytesLoaded/event.bytesTotal*100)
    });
  }
  
  window.playingListener = function(event){
      postMessage({"action":"nowPlaying", "song":event.activeSong, "notify": false});
  }
  
  jQuery(window).unload(unloadListener);
  jQuery.subscribe("gs.player.nowplaying", nowPlayingListener);
  jQuery.subscribe("gs.player.playing", playingListener);
  jQuery.subscribe("gs.player.stopped", stoppedListener);

} catch(e) { };