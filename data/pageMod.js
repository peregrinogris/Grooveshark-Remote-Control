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
  window.unloadListener = function(e){
    postMessage({"action":"unload"});
    return true;
  }
  
  window.nowPlayingListener = function(song){
    postMessage({"action":"nowPlaying", "song":song})
  }
  
  window.stoppedListener = function(song){
    postMessage({"action":"stopped"})
  }
  
  jQuery(window).unload(unloadListener);
  jQuery.subscribe("gs.player.nowplaying", nowPlayingListener);
  jQuery.subscribe("gs.player.stopped", stoppedListener);
  
} catch(e) { };