import Backbone from '@canvas/backbone';

export default class AmaintTermList extends Backbone.Collection {

  initialize(userId) {
    this.userId = userId;
    super.initialize();
  }

  url() {
    return `/sfu/api/v1/amaint/user/${this.userId}/term`;
  }

}
