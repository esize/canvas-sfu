import _ from 'underscore';
import Backbone from '@canvas/backbone';
import SelectableCourseListView from '../courses/SelectableCourseListView';

const TermView = Backbone.View.extend({

  tagName: 'li',

  template: _.template('<span class="term tag"><%= name %></span>'),

  render: function() {
    const courseListView = new SelectableCourseListView({collection: this.model.courses});
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.append(courseListView.render().el);
    return this;
  }

});

export default TermView;
