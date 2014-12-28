Flamite.LikeController = Ember.ArrayController.extend({
  delay: 1500,
  running: false,
  getMore: false,
  displayNb: 0,
  users: [],
  likeAuto: false,
  noMore: false,
  stats: {
    profiles: 0,
    matchs: 0
  },

  start: function() {
    return this.get('running') ? 'Break!' : 'Start!';
  }.property('running'),

  renderUser: function() {
    var users = this.get('users');
    var displayNb = this.get('displayNb');

    // check running status
    if (this.get('getMore')) {
      return;
    }

    // check users length
    if (users.length === 0) {
      this.set('getMore', true);
      this.get('target').send('getMore');
      return;
    }

    // display user
    this.unshiftObject(users[0]);
    this.set('stats.profiles', this.get('stats.profiles') + 1);

    users.shift();

    if (displayNb >= 8) {
      this.popObject();
    }

    this.set('users', users);
    this.set('displayNb', displayNb + 1);

    if (this.get('running')) {
      setTimeout(function(context) {
        context.renderUser.call(context);
      }, this.get('delay'), this);
    }
  },

  runningChanged: function() {
    if (this.get('running')) {
      this.renderUser();
    }
  }.observes('running'),

  gotMore: function(users) {
    var self = this;

    if (users.length == 0) {
      this.set('noMore', true);
      this.set('getMore', false);

      setTimeout(function() {
        self.renderUser();
      }, 4000);
    } else {
      this.set('users', this.get('users').concat(users));
      this.set('noMore', false);
      this.set('getMore', false);
      this.renderUser();
    }
  },

  init: function() {
    var self = this;

    this._super();

    setTimeout(function() {
      self.renderUser();
    }, 1000);
  },

  actions: {
    changeRunningStatus: function() {
      this.toggleProperty('running');
    },

    like: function(like, user, callback) {

      _gaq && _gaq.push(['_trackEvent', 'matches', like ? 'like' : 'dislike']);

      chrome.runtime.sendMessage({
        type: 'request',
        path: (like ? 'like' : 'dislike') + '/' + user.id
      }, function(result) {
        if (result.match) {
          _gaq && _gaq.push(['_trackEvent', 'match', 'hit']);
          this.set('stats.matchs', this.get('stats.matchs') + 1);
        }

        callback(result);
      });

      if (!this.get('running')) {
        this.renderUser();
      }
    },

    changeDelay: function() {
      this.set('delay', $('.delay-select').val());
    },

    changeLocation: function() {
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent($('#field-location').val());
      var controller = this;
      $.getJSON(url, function(googleResponse) {
        var point = googleResponse.results[0].geometry.location;
        chrome.runtime.sendMessage(
          {
            type: 'request',
            method: 'POST',
            path: 'user/ping',
            data: {lat: point.lat, lon: point.lng}
          },
          function(tinterResponse) {
            if(!tinterResponse.error && tinterResponse.status == 200)
              location.reload();
          }
        );
      });
    }
  }
});
