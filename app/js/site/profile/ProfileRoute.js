Flamite.ProfileRoute = Ember.Route.extend({
  model: function(params) {
    return new Ember.RSVP.Promise(function(resolve) {
      chrome.runtime.sendMessage({
        type: 'request',
        path: 'user/' + params.user
      }, function(obj) {
        var _user = obj.results;
        var photo = null;
        var photos = [];

        for (var i = 0; i < 6; i++) {

          if (_user.photos[i]) {
            photos[i] = {
              big: _user.photos[i].processedFiles[0].url,
              small: _user.photos[i].processedFiles[2].url
            };

            if (i == 0) {
              photo = _user.photos[i].processedFiles[3].url;
            }
          }
        }

        var birth_date = new Date(_user.birth_date);
        var ping_time = new Date(_user.ping_time);

        resolve({
          id: _user._id,
          name: _user.name,
          bio: Flamite.formatText(_user.bio),
          age: Flamite.calculateAge(birth_date),
          ping_time: Flamite.formatDate(ping_time, true),
          distance_km: Math.round(_user.distance_mi * 1.609),
          distance_mi: _user.distance_mi,
          photos: photos,
          photo: photo
        });
      });
    });
  }
});
