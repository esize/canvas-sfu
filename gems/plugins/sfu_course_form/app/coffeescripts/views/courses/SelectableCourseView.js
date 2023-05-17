import $ from 'jquery';
import _ from 'underscore';
import CourseView from './CourseView';

export default class SelectableCourseView extends CourseView {
  initialize() {
    this.template = _.template('<div><input type="checkbox" id="chk-course-<%= cid %>-<%= sis_source_id %>" <% if (selected) { %>checked="checked"<% } %> /> <label for="chk-course-<%= cid %>-<%= sis_source_id %>"><span class="term tag"><%= term %></span> <%= displayName %><% if (sections.length) { %></div><div class="tutorial_sections">&mdash; includes these sections: <%= sections.join(", ") %></div><% } %></label>');
    this.events = {
      'change input': 'handleChange'
    };
  }

  render() {
    // cid maintains checkbox uniqueness when multiple courses with the same sis_source_id are present
    // (e.g. when user searches for exactly the same courses as the ones suggested)
    this.$el.html(this.template($.extend(this.model.toJSON(), {cid: this.model.cid})));
    return this;
  }

  handleChange(event) {
    this.model.selected = event.target.checked;
    $(document).trigger('selectablecoursechange', [this.model, event.target.checked]);
  }
}
