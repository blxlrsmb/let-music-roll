LIGHTS.API = function (baseurl) {
  this.initialize(baseurl)
}

LIGHTS.API.prototype = {
  initialize: function(baseurl) {
    this.baseurl = baseurl
  },
  fetch: function(item, callback) {
    $.getJSON(this.baseurl + "/fetch/" + item,
      callback
    )
  }
}

