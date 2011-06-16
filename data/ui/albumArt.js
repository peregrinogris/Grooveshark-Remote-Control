self.port.on("album", function(msg) {
  document.getElementById('albumArt').src = msg
});