import _ from 'underscore';
import Backbone from '@canvas/backbone';

const CourseView = Backbone.View.extend({

  tagName: 'li',

  template: _.template('<div><span class="term tag"><%= term %></span> <%= displayName %><% if (sections.length) { %></div><div class="tutorial_sections">&mdash; includes these sections: <%= sections.join(", ") %></div><% } %>'),

  initialize: function() {
    this.model.on('change', function() { this.render(); }, this);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }

});

export default CourseView;
