import _ from 'underscore';
import Backbone from '@canvas/backbone';

export default class CourseView extends Backbone.View {
  initialize() {
    this.tagName = 'li';
    this.template = _.template('<div><span class="term tag"><%= term %></span> <%= displayName %><% if (sections.length) { %></div><div class="tutorial_sections">&mdash; includes these sections: <%= sections.join(", ") %></div><% } %>');

    this.model.on('change', function() { this.render(); }, this);
  }

  render() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
}
