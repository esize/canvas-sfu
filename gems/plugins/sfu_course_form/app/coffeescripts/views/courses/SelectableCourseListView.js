import CourseListView from './CourseListView';
import SelectableCourseView from './SelectableCourseView';

export default class SelectableCourseListView extends CourseListView {
  renderOne(course) {
    const courseView = new SelectableCourseView({model: course});
    this.$el.append(courseView.render().el);
  }
}
