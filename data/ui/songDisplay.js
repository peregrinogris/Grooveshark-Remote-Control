var runningInterval = -1;
const INTERVAL = 10; //Transition Duration
const GUTTER = 30;  //Portion of the song title that won't scroll

function startScrolling(){
  var scrollLeft = 0;
  var songTitle = document.getElementById('songDisplay');
  var songTitleContainer = document.getElementById('songDisplayContainer');

  if(songTitle.offsetWidth > songTitleContainer.offsetWidth) {
    songTitle.style.left = '0px';
    songTitle.style.MozTransitionProperty = 'left';
    songTitle.style.MozTransitionDuration = INTERVAL+'s';
    songTitle.style.left = -1 * ( songTitle.offsetWidth - GUTTER ) + 'px';
    function scrollText(){
      if(songTitle.style.left == -1 * ( songTitle.offsetWidth - GUTTER ) + 'px') {
        //Rewind text
        songTitle.style.MozTransitionProperty = 'none';
        songTitle.style.left = ( songTitleContainer.offsetWidth - GUTTER )+'px';
        scrollText();
      } else {
        //Start scrolling from the left
        if(songTitle.style.left == ( songTitleContainer.offsetWidth - GUTTER )+'px') {
          songTitle.style.MozTransitionProperty = 'left';
          songTitle.style.MozTransitionDuration = ( INTERVAL * 2 )+'s';
          songTitle.style.left = -1*( songTitle.offsetWidth - GUTTER )+'px';
          runningInterval = setTimeout(scrollText, INTERVAL * 2 * 1000);
        }
      }
    }
    runningInterval = setTimeout(scrollText, INTERVAL * 1000);
  }
}

function stopScrolling(){
  if(runningInterval > 0)
    window.clearTimeout(runningInterval);

  document.getElementById('songDisplay').style.MozTransitionProperty = 'none';
  document.getElementById('songDisplay').style.left = '0px';
}

function updateProgressMeters(position, buffered){
  var bufferMeter = document.querySelector('.buffered');
  var positionMeter = document.querySelector('.playing');

  bufferMeter.style.minWidth = buffered+'%';
  bufferMeter.style.display = 'block';

  positionMeter.style.minWidth = position+'%';
  positionMeter.style.display = 'block';
}

self.port.on('songProgress', function (msg) {
  updateProgressMeters(msg.position, msg.buffered);
});

self.port.on('nowPlaying', function (song) {
  document.querySelector('#songDisplay').innerHTML =
    song.songName + ' - ' + song.artistName
  stopScrolling();  //Stop the posible scrolling of the last song
  startScrolling(); //if needed, start scrolling the text
});

self.port.on('notPlaying', function (msg) {
  document.querySelector('#songDisplay').innerHTML = 'Not Playing';
  stopScrolling();
});
