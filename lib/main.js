const widgets = require("widget");
const panels = require("panel");
const data = require("self").data;
const pageMod = require("page-mod");
const notifications = require("notifications");
const simpleStorage = require("simple-storage").storage;

//Global Flags
var uiReady = false;
var musicPlaying = false;
var songsQueued = false;

//Default Settings
if(!simpleStorage.settings){
  simpleStorage.settings = {};
  simpleStorage.settings['notifications'] = true;
}

var gsPageMod = pageMod.PageMod({
  include: [
    'http://grooveshark.com/*',
    'http://listen.grooveshark.com/*',
    'http://preview.grooveshark.com/*'
  ],
  contentScriptWhen: 'end',
  contentScriptFile: data.url('pageMod.js'),
  onAttach: function onAttach(worker, mod) {
    if(!uiReady) {
        let panelAlbumArt = panels.Panel({
          contentURL: data.url('ui/albumArt.html'),
          contentScriptFile: data.url('ui/albumArt.js'),
          width: 222,
          height: 222
        })

        let wgAlbumArt = widgets.Widget({
          label:"Album Art",
          id: 'wgAlbumArt',
          content: '<img src="'+data.url('ui/icons/image.png') +
                 '" style="cursor:pointer;"/>',
          width: 16,
          panel: panelAlbumArt,
          onClick: function() {
            if(songsQueued) {
              this.panel.show();
            }
          }
        });

        let wgDisplaySong = widgets.Widget({
          label:"Currently Playing",
          id: 'wgDisplaySong',
          contentURL: data.url('ui/songDisplay.html'),
          contentScriptFile: data.url('ui/songDisplay.js'),
          contentScriptWhen: 'ready',
          width: 300
        });

      let wgPreviousSong = widgets.Widget({
        label:"Previous Song",
        id: 'wgPreviousSong',
        content: '<img src="'+data.url('ui/icons/control-skip-180.png') +
                 '" style="cursor:pointer;"/>',
        onClick: function() {if(songsQueued) worker.port.emit('previous')}
      });

      let wgPlayPauseSong = widgets.Widget({
        label:"Play Song",
        id: 'wgPlayPauseSong',
        content: '<img src="'+data.url('ui/icons/control.png') +
         '" style="cursor:pointer;"/>',
        onClick: function(){
          if(!musicPlaying) {
            if(songsQueued) {
              worker.port.emit('play')
              this.content = '<img src="'+data.url('ui/icons/control-pause.png') +
                             '" style="cursor:pointer;"/>';
              this.label = "Pause Song";
              musicPlaying = true;
            }
          } else {
            worker.port.emit('pause')
            this.content = '<img src="'+data.url('ui/icons/control.png') +
                           '" style="cursor:pointer;"/>';
            this.label = "Play Song";
            musicPlaying = false;
          }
        }
      });

      let wgNextSong = widgets.Widget({
        label:"Next Song",
        id: 'wgNextSong',
        content: '<div><img src="'+data.url('ui/icons/control-skip.png') +
                 '" style="cursor:pointer; float:left; width:16px"/></div>',
        onClick: function() {if(songsQueued)worker.port.emit('next')},
        width: 16
      });

      let panelSettings = panels.Panel({
        contentURL: data.url('ui/settings.html'),
        contentScriptFile: data.url('ui/settings.js'),
        contentScriptWhen: 'ready',
        width: 200,
        height: 40
      });

      panelSettings.port.on("getSettings", function(msg) {
        panelSettings.port.emit("update", simpleStorage.settings);
      });

      panelSettings.port.on("change", function(msg) {
        simpleStorage.settings[msg.setting] = msg.value;
      });

      let wgSettings = widgets.Widget({
        label:"Grooveshark Remote Control Settings",
        id: 'wgSettings',
        content: '<img src="'+data.url('ui/icons/equalizer.png') +
               '" style="cursor:pointer;"/>',
        width: 16,
        panel: panelSettings
      });

      uiReady = true;
      worker.port.on("unload", function (msg) {
        wgPlayPauseSong.destroy();
        wgAlbumArt.destroy();
        wgDisplaySong.destroy();
        wgPreviousSong.destroy();
        wgNextSong.destroy();
        wgSettings.destroy();
        uiReady = false;
      });

      worker.port.on("nowPlaying", function (msg) {
        musicPlaying = true;
        songsQueued = true;
        wgPlayPauseSong.content = '<img src="'+data.url('ui/icons/control-pause.png') +
                             '" style="cursor:pointer;"/>';
        wgPlayPauseSong.label = "Play Song";

        wgDisplaySong.port.emit("nowPlaying", msg);

        let albumArtURL = msg.song.artPath + 'm' +
                ((msg.song.CoverArtFilename) ? msg.song.CoverArtFilename : 'default.png');

        let albumThumbURL = msg.song.artPath + 't' +
                ((msg.song.CoverArtFilename) ? msg.song.CoverArtFilename : 'default.png');

        panelAlbumArt.port.emit("album", albumArtURL);

        //If the user enabled notifications display it
        if(msg.notify && simpleStorage.settings['notifications']) {
          notifications.notify({
            title: msg.song.ArtistName,
            text: msg.song.SongName,
            iconURL: albumThumbURL
          });
        }
      });

      worker.port.on("stopped", function (msg) {
        wgDisplaySong.port.emit('notPlaying');
        wgPlayPauseSong.content = '<img src="'+data.url('ui/icons/control.png') +
                       '" style="cursor:pointer;"/>';
        wgPlayPauseSong.label = "Play Song";
        musicPlaying = false;
        songsQueued = msg.songsQueued;
      });

      worker.port.on("songProgress", function (msg) {
        wgDisplaySong.port.emit("songProgress", msg);
      });
    }
  }
});


//Developing shortcut
//require("tabs").activeTab.url = 'http://grooveshark.com';
