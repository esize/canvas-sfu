import Backbone from '@canvas/backbone';

export default class SandboxList extends Backbone.Collection {

  initialize(userId) {
    this.userId = userId;
    super.initialize();
  }

  url() {
    return `/sfu/api/v1/user/${this.userId}/sandbox`;
  }

}
