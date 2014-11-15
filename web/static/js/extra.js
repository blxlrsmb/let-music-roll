$(document).ready(function() {
  $('#droparea').on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('drop');

    //retrieve uploaded files data
    var files = e.originalEvent.dataTransfer.files;
    console.log(files);
    var music = files[0];
    if (music.type.match(/audio.*/)) {
      var reader = new FileReader();
      reader.onload = function(d) {
        LIGHTS.Lights.instance.loader.doLoad(d.target.result);
      };
      LIGHTS.Lights.instance.home.isLoading = true;
      LIGHTS.Lights.instance.home.hasUploaded = true;
      LIGHTS.Lights.instance.home.alpha = 0;
      reader.readAsDataURL(music);
    }
    return false;
  })
  $('#droparea').on('dragover', function(e) {
    return false;
  })
})
