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
                  console.error('Failed to fetch config: ' + result.detail);
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

WavGraph = function(Light) {
  Highcharts.setOptions({
    chart: {
      style: {
        fontSize: '3px'
      }
    },
    global: {
      useUTC: false
    }
  });

  var gen_empty_data = function(){
    var data = [],
      time = new Date();
    time.setHours(0);time.setMinutes(0);time.setSeconds(0);
    for (var i = -10; i <= 0; i += 1) {
      data.push({
        x: time.getTime() + i * 1000,
        y: 0
      });
    }
    return data;
  };
  this.light = Light;
  // example data
  var datapoints = LIGHTS.Music.AVdata;
  var nowindex = -1;
  $('#graph-container').highcharts({
    chart: {
      type: 'spline',
      animation: Highcharts.svg, // don't animate in old IE
      marginRight: 3,
      events: {
        load: function () {
          // set up the updating of the chart each second
          var series = this.series;
          setInterval(function () {
            if (nowindex + 1 < datapoints.length && LIGHTS.time > datapoints[nowindex + 1].time) {
              nowindex ++;
              var x = new Date(),
              y = datapoints[nowindex];
              x.setHours(0);
              x.setMinutes(0);
              x.setSeconds(y.time);
              series[0].addPoint([x.getTime(), y.a], true, true);
              series[1].addPoint([x.getTime(), y.v], true, true);
            }
          }, 500);
        }
      }
    },
    title: { text: 'A/V' },
    xAxis: {
      type: 'datetime',
      tickPixelInterval: 200
    },
    yAxis: {
      title: { text: 'value' },
      plotLines: [{ value: 0, width: 1, color: '#808080' }],
      min: -0.5,
      max: 0.5
    },
    credits: false,
    legend: { enabled: true},
    exporting: { enabled: false },
    series: [{
      name: 'Arousal',
      data: gen_empty_data()
    }, {
      name: 'Valence',
      data: gen_empty_data()
    }]
  });
};

WavGraph.prototype = { };
