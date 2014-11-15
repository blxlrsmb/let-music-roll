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
      done = 0;
      var musicSrc = null, config = null;
      (function() {
        var reader = new FileReader();
        reader.onload = function(d) {
          musicSrc = d.target.result;
          if (config)
            LIGHTS.Lights.instance.loader.doLoad(musicSrc, config);
        };
        LIGHTS.Lights.instance.home.isLoading = true;
        LIGHTS.Lights.instance.home.hasUploaded = true;
        LIGHTS.Lights.instance.home.alpha = 0;
        reader.readAsDataURL(music);
      })();
      (function() {
        var reader = new FileReader();
        reader.onload = function(d) {
          var md5sum = md5(d.target.result);
          LIGHTS.Lights.instance.loader.api.fetchByHash(md5sum, function(result) {
            if (result.status != 'success') {
              var data = new FormData();
              data.append('audio', music);
              LIGHTS.Lights.instance.loader.api.fetchByAudio(data, function(result) {
                if (result.status != 'success') {
                  console.error('Failed to fetch config');
                } else {
                  config = result.data;
                  if (musicSrc)
                    LIGHTS.Lights.instance.loader.doLoad(musicSrc, config);
                }
              });
            } else {
              config = result.data;
              if (musicSrc)
                LIGHTS.Lights.instance.loader.doLoad(musicSrc, config);
            }
          })
        };
        reader.readAsBinaryString(music);
      })();
    }
    return false;
  })
  $('#droparea').on('dragover', function(e) {
    return false;
  })
})
