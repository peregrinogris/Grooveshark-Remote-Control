onMessage = function onMessage(msg) {
  switch(msg.action){
    
    case 'songProgress':
      updateProgressMeters(msg.position, msg.buffered);
      break
    
    case 'nowPlaying':
      document.querySelector('#songDisplay').innerHTML =
        msg.song.SongName + ' - ' + msg.song.ArtistName
      stopScrolling();  //Stop the posible scrolling of the last song
      startScrolling(); //if needed, start scrolling the text
      break
    
    case 'notPlaying':
      document.querySelector('#songDisplay').innerHTML =
        'Not Playing';
      stopScrolling();
      break
  }
}