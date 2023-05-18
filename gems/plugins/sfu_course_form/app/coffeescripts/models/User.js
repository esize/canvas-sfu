import $ from 'jquery';
import Backbone from '@canvas/backbone';

export default class User extends Backbone.Model {

  initialize(userId) {
    this.userId = userId;
    this.hasLoaded = false;

    this.on('change', function() {
      this.hasLoaded = true;
      $(document).trigger('userloaded');
    });
    this.on('error', function() {
      this.hasLoaded = false;
      $(document).trigger('userloaderror');
    });

    super.initialize();
  }

  url() {
    return `/sfu/api/v1/amaint/user/${this.userId}`;
  }

}
