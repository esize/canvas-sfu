import Backbone from '@canvas/backbone';
import CourseView from './CourseView';

const CourseListView = Backbone.View.extend({

  tagName: 'ul',

  initialize: function() {
    this.collection.on('request', function() { this.$el.html('<li>Loading&hellip;</li>'); }, this);
    this.collection.on('sync', function() { this.render(); }, this);
    this.collection.on('error', function() { this.$el.html('<li>No available courses</li>'); }, this);
  },

  render: function() {
    if (this.collection.length) {
      this.$el.empty();
      this.collection.each(this.renderOne, this);
    } else {
      this.$el.html('<li>No courses</li>');
    }
    return this;
  },

  renderOne: function(course) {
    const courseView = new CourseView({model: course});
    this.$el.append(courseView.render().el);
  }

});

export default CourseListView;
