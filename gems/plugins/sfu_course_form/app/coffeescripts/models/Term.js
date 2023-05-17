import Backbone from '@canvas/backbone';
import CourseList from '../collections/CourseList';

export default class Term extends Backbone.Model {

  initialize() {
    this.courses = new CourseList();
  }

  fetchCourses(userId) {
    this.courses.userId = userId;
    this.courses.term = this;
    this.courses.fetch();
  }

}
