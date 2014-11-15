LIGHTS.API = function (baseurl) {
  this.initialize(baseurl)
}

LIGHTS.API.prototype = {
  initialize: function(baseurl) {
    this.baseurl = baseurl
  },
  fetchByHash: function(item, callback) {
    $.getJSON(this.baseurl + "/get_animation_config_by_hash?hash_idx=" + item, callback)
  },
  fetchByAudio: function(item, callback) {
    $.ajax({
      url: this.baseurl + "/get_animation_config_by_audio",
      method: 'post',
      data: item,
      processData: false,
      contentType: false,
      dataType: 'json',
      success: function(data, status, xhr) {
        callback(data);
      }
    })
  }
}

