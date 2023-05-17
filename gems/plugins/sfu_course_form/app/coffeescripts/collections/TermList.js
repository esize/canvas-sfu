import Backbone from '@canvas/backbone';
import Term from '../models/Term';

export default class TermList extends Backbone.Collection {

  initialize() {
    this.model = Term;
  }

  fetchAllCourses(userId) {
    this.userId = userId;
    this.each(this.fetchCoursesForTerm, this);
  }

  fetchCoursesForTerm(term) {
    term.fetchCourses(this.userId);
  }

};
