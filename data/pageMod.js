onMessage = function onMessage(action) {
  switch(action) {
    case "play":
      GS.player.resumeSong();
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
};

try{
  var flag = false;
  window.unloadListener = function(e){
    postMessage({"action":"unload"});
    return true;
  }
  
  window.nowPlayingListener = function(song){
    postMessage({"action":"nowPlaying", "song":song})
    if (!flag) {
      GS.player.player.setPlaybackStatusCallback(
        "function(b){GS.Controllers.PlayerController.instance().playerStatus(b); progressListener(b);}"
      );
    }
  }
  
  window.stoppedListener = function(song){
    postMessage({"action":"stopped"})
  }
  
  window.progressListener = function(event){
    postMessage({
      "action":"songProgress",
      "position": Math.ceil(event.position/event.duration*100),
      "buffered": Math.ceil(event.bytesLoaded/event.bytesTotal*100)
    });
  }
  
  jQuery(window).unload(unloadListener);
  jQuery.subscribe("gs.player.nowplaying", nowPlayingListener);
  jQuery.subscribe("gs.player.stopped", stoppedListener);

} catch(e) { };