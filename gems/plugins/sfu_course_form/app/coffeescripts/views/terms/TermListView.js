import Backbone from '@canvas/backbone';
import TermView from './TermView';

export default class TermListView extends Backbone.View {

  initialize() {
    this.tagName = 'ul';
  }

  render() {
    if (this.collection.length) {
      this.collection.each(this.renderOne, this);
    } else {
      this.$el.html('<li>No terms</li>');
    }
    return this;
  }

  renderOne(term) {
    const termView = new TermView({model: term});
    this.$el.append(termView.render().el);
  }

}
