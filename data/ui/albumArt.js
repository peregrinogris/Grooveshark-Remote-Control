var $ = function (selector) {
  return document.querySelector(selector);
}

self.port.on("album", function(msg) {
  $('#albumArt').src = msg.albumArtURL
  $('#songName').innerHTML = msg.songName;
  $('#artistName').innerHTML = msg.artistName;
  $('#albumName').innerHTML = msg.albumName;
  $('.background').style.minHeight = $('.songInfo').clientHeight+'px';
});
