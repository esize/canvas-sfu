import $ from 'jquery';
import Backbone from '@canvas/backbone';

export default class Course extends Backbone.Model {

  initialize(term) {
    this.term = term;
    this.selected = false; // TODO: find a cleaner way to keep track of this runtime flag
  }

  // make useful custom attributes available to callers of toJSON()
  toJSON() {
    return $.extend(Backbone.Model.prototype.toJSON.call(this), {
      term: this.term.get('name'),
      selected: this.selected,
      displayName: this.displayName()
    });
  }

  addSections(newSections) {
    // NOTE: does not currently check if course already has sections
    if (newSections.length > 0) {
      this.set({
        sections: newSections,
        key: `${this.get('key')}:::${newSections.join(',').toLowerCase()}`
      });
    }
  }

  displayName() {
    return `${this.get('name')}${this.get('number')} - ${this.get('section')} ${this.get('title')}`;
  }

}
