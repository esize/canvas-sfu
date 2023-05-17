import _ from 'underscore';
import Backbone from '@canvas/backbone';
import SelectableCourseListView from '../courses/SelectableCourseListView';

export default class TermView extends Backbone.View {

  initialize() {
    this.tagName = 'li';
    this.template = _.template('<span class="term tag"><%= name %></span>');
  }

  render() {
    const courseListView = new SelectableCourseListView({collection: this.model.courses});
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.append(courseListView.render().el);
    return this;
  }

}
