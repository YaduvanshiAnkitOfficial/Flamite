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

      chrome.runtime.sendMessage({
        type: 'request',
        path: (like ? 'like' : 'pass') + '/' + user.id
      }, function(result) {
        if (result.match) {
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
    }
  }
});
