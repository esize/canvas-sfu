import _ from 'underscore';
import Backbone from '@canvas/backbone';

const SandboxListView = Backbone.View.extend({

  tagName: 'div',

  template: _.template('<p>Here is a list of existing sandbox courses for <span class="username-display"><%= username %></span>:</p><ul></ul>'),
  itemTemplate: _.template('<li><a href="/courses/<%= id %>" target="_blank"><%= name %></a></li>'),
  emptyTemplate: _.template('<p><em>There are no existing sandboxes for <span class="username-display"><%= username %></span>.</em></p>'),

  username: 'unknown',

  initialize: function() {
    this.collection.on('request', function() { this.$el.html('<p>Loading existing sandbox courses&hellip;</p>'); }, this);
    this.collection.on('sync', function() { this.render(); }, this);
  },

  render: function() {
    if (this.collection.length) {
      this.$el.empty();
      this.$el.append(this.template({ username: this.username }));
      this.collection.each(this.renderOne, this);
    } else {
      this.renderEmpty();
    }
    return this;
  },

  renderOne: function(sandbox) {
    console.log(this.$el.children('ul'));
    console.log(sandbox.toJSON());
    this.$el.children('ul').append(this.itemTemplate(sandbox.toJSON()));
  },

  renderEmpty: function() {
    this.$el.html(this.emptyTemplate({ username: this.username }));
  }

});

export default SandboxListView;
