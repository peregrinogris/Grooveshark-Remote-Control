//using experimental unsafeWindow - Bug 660780

self.port.on("play", function () {
  unsafeWindow.top.Grooveshark.togglePlayPause();
});

self.port.on("pause", function () unsafeWindow.top.Grooveshark.pause() );
self.port.on("next", function () unsafeWindow.top.Grooveshark.next() );
self.port.on("previous", function () unsafeWindow.top.Grooveshark.previous() );

try{
  function unloadListener(e){
    self.port.emit("unload");
    return true;
  }

  function nowPlayingListener(song){
    if(song.ArtistName) {
      self.port.emit("nowPlaying", {"song":song, "notify": true});
    }
  }

  function stoppedListener(song){
    self.port.emit("stopped", {"songsQueued":song.AlbumID > 0});
  }

  // Expose this function to document scope as we register it before with
  // `setPlaybackStatusCallback`
  function progressListener(event){
    self.port.emit("songProgress", {
      "position": Math.ceil(event.song.position/event.song.calculatedDuration*100)
    });
    
    if (event.status == "playing") {
    	playingListener(event.song);
    }
  }
  exportFunction(progressListener, unsafeWindow, {defineAs: "gsrc_progressListener"});
  
  function insertGSCallback() {
	  var script = window.top.document.createElement("script");
	  script.textContent = "window.top.Grooveshark.setSongStatusCallback(gsrc_progressListener);";
	  window.top.document.body.appendChild(script);
  }
  
  exportFunction(insertGSCallback, unsafeWindow, {defineAs: "insertGSCallback"});
  unsafeWindow.insertGSCallback();
  
  function playingListener(song){
      self.port.emit("nowPlaying", {"song":song, "notify": false});
  }
  
  unsafeWindow.onunload = unloadListener;

} catch(e) { console.exception(e); };
