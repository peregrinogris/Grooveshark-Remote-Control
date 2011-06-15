var inputs = document.querySelectorAll('input');

for (var i = 0; i < inputs.length; i++) {
  inputs.item(i).addEventListener('change', function(){
    self.port.emit('change', {'setting':this.id, 'value':this.checked});
  }, false)
}

self.port.emit('getSettings');
self.port.on('update', function onMessage(settings) {
  for (var id in settings) {
    document.getElementById(id).checked = settings[id];
  }
});