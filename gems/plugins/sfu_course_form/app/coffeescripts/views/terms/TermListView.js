import Backbone from '@canvas/backbone';
import TermView from './TermView';

const TermListView = Backbone.View.extend({

  tagName: 'ul',

  render: function() {
    if (this.collection.length) {
      this.collection.each(this.renderOne, this);
    } else {
      this.$el.html('<li>No terms</li>');
    }
    return this;
  },

  renderOne: function(term) {
    const termView = new TermView({model: term});
    this.$el.append(termView.render().el);
  }

});

export default TermListView;
