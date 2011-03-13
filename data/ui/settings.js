var inputs = document.querySelectorAll('input');

for (var i = 0; i < inputs.length; i++) {
  inputs.item(i).addEventListener('change', function(){
    postMessage({'setting':this.id, 'value':this.checked});
  }, false)
}

postMessage({'action':'getSettings'});
onMessage = function onMessage(settings) {
  for (var id in settings) {
    document.getElementById(id).checked = settings[id];
  }
}