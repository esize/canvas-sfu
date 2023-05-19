import CourseListView from './CourseListView';
import SelectableCourseView from './SelectableCourseView';

const SelectableCourseListView = CourseListView.extend({
  renderOne: function(course) {
    const courseView = new SelectableCourseView({model: course});
    this.$el.append(courseView.render().el);
  }
});

export default SelectableCourseListView;
