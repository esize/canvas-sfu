import Backbone from '@canvas/backbone';
import Term from '../models/Term';

const TermList = Backbone.Collection.extend({

  model: Term,

  fetchAllCourses: function(userId) {
    this.userId = userId;
    this.each(this.fetchCoursesForTerm, this);
  },

  fetchCoursesForTerm: function(term) {
    term.fetchCourses(this.userId);
  }

});

export default TermList;
