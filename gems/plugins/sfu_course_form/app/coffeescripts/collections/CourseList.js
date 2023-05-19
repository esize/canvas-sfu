import _ from 'underscore';
import Backbone from '@canvas/backbone';
import Course from '../models/Course';

export default class CourseList extends Backbone.Collection {

  initialize(term) {
    this.model = Course;
    this.comparator = 'sis_source_id';

    this.term = term;

    this.on('sync', function() {
      this.each(function(course) { course.term = this.term; }, this);
    });

    super.initialize();
  }

  url() {
    return `/sfu/api/v1/amaint/user/${this.userId}/term/${this.term.get('sis_source_id')}`;
  }

  has(course) {
    return this.any(existingCourse => existingCourse.get('sis_source_id') === course.get('sis_source_id'));
  }

  terms() {
    return _.uniq(this.map(course => course.term));
  }

}
