/**;
 * Flamite
 */

// Init app
var Flamite = Ember.Application.create({
  rootElement: '#app'
});

// Router
Flamite.Router.map(function() {
  this.route('like', {path: '/'});
  this.route('profile', {path: '/profile/:user'});
  
  this.resource('matches', function() {
    this.route('match', {path: '/:match_id'});
  });
});

// SessionApplicationRouteMixin
Flamite.SessionApplicationRouteMixin = Ember.Mixin.create({
  beforeModel: function(transition) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      chrome.runtime.sendMessage({type: 'user'}, function(user) {
        if (user) {
          Flamite.user = user;
          Flamite.user.photo = user.photos[0].processedFiles[3].url;
          resolve();
        }
      });
    });
  }
});
