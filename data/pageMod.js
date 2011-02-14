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
  
    jQuery(window).unload(function(e){
        postMessage({"action":"unload"});
        return true;
    });
    
    jQuery.subscribe("gs.player.nowplaying", function(song){
      postMessage({"action":"nowPlaying", "song":song})
    });
    
    jQuery.subscribe("gs.player.stopped", function(song){
      postMessage({"action":"stopped"})
    });
    
} catch(e) { };