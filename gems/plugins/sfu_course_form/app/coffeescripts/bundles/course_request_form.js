import $ from 'jquery';
import 'jqueryui/autocomplete';
import _ from 'underscore';
import React from 'react';
import ReactDOM from 'react-dom';
import User from '../models/User';
import Term from '../models/Term';
import Course from '../models/Course';
import AmaintTermList from '../collections/AmaintTermList';
import TermList from '../collections/TermList';
import TermListView from '../views/terms/TermListView';
import CourseList from '../collections/CourseList';
import CourseListView from '../views/courses/CourseListView';
import SelectableCourseListView from '../views/courses/SelectableCourseListView';
import SandboxList from '../collections/SandboxList';
import SandboxListView from '../views/sandboxes/SandboxListView';
import { SFUCopyrightComplianceNotice } from '@sfu/sfu-copyright-compliance-notice';

let user = {};
let currentUser = {};
const terms = new TermList;
const suggestedTerms = new TermList;
let amaintTerms = {};
const searchedCourseList = new CourseList();
let searchedCourseListView = {};
const selectedCourseList = new CourseList();
let selectedCourseListView = {};
let searchTermSelect = {};

let userIdTextbox = {};
let enrollMeCheckbox = {};
let enrollMeAsSelect = {};
let crosslistCheckbox = {};
let crosslistTitle = {};

let nonCalendarCourseTextbox = {};
let nonCalendarTermSelect = {};

let sandboxList = {};
let sandboxListView = {};

let adhocTextbox = {};

const timeId = (function() {
  const now = new Date();
  return [now.getMonth() + 1, now.getDate(), now.getYear() - 100, now.getTime().toString().substring(10)].join('');
})();

const getUsernameToDisplay = function() {
  return (user === currentUser) ? 'yourself' : user.get('sfu_id');
};

const getCourses = function() {
  // first, fetch terms in which the user teaches
  amaintTerms = new AmaintTermList(user.get('sfu_id'));
  amaintTerms.fetch({
    success: function(incomingTerms) {
      // then, add ones that matches our master "terms" list to a list of suggested terms
      incomingTerms.each(function(incomingTerm) {
        const matchedTerm = terms.find(term => incomingTerm.get('peopleSoftCode') === term.get('sis_source_id'));
        if (matchedTerm) {
          suggestedTerms.add(matchedTerm);
        }
      });
      // finally, fetch and display all courses from these suggested terms
      const termListView = new TermListView({collection: suggestedTerms});
      $('#courses-suggested').html(termListView.render().el);
      suggestedTerms.fetchAllCourses(user.get('sfu_id'));
    },
    error: function() {
      $('#courses-suggested').html('<p>No suggested courses found</p>');
    }
  });
  return suggestedTerms;
};

const getSandboxes = function() {
  sandboxList = new SandboxList(user.get('sfu_id'));
  sandboxListView = new SandboxListView({
    collection: sandboxList,
    el: $('#sandboxes')
  });
  sandboxListView.username = getUsernameToDisplay();
  sandboxList.fetch({
    error: function() {
      sandboxListView.renderEmpty();
    }
  });
};

const initPayload = function() {
  const payload = {username: user.get('sfu_id')};
  if (enrollMeCheckbox.prop('checked')) {
    payload['enroll_me'] = currentUser.get('sfu_id');
    payload['enroll_me_as'] = enrollMeAsSelect.val();
  }
  return payload;
};

const processSubmitCalendar = function() {
  if (selectedCourseList.length === 0) {
    alert('You must select at least one course to continue.');
    return;
  }

  showStep('4');

  const payload = initPayload();
  if (crosslistCheckbox.prop('checked')) {
    payload['cross_list'] = true;
  }

  selectedCourseList.each(course => {
    payload[`selected_course_${course.cid}_${course.get('peopleSoftCode')}`] = course.get('key');
  });

  submitRequest(payload, '3-calendar');
};

const processSubmitNonCalendar = function() {
  if ($.trim(nonCalendarCourseTextbox.val()) === '') {
    alert('The Course Name must not be empty');
    return;
  }

  showStep('4');
  const payload = initPayload();

  const termCode = nonCalendarTermSelect.val();

  payload[`selected_course_${timeId}_${nonCalendarTermSelect.val()}`] = `ncc-${payload.username}-${timeId}-${termCode}-${nonCalendarCourseTextbox.val()}`;

  submitRequest(payload, '3-non_calendar');
};

const processSubmitSandbox = function() {
  showStep('4');
  const payload = initPayload();

  payload[`selected_course_sandbox_${timeId}`] = `sandbox-${payload.username}-${timeId}`;

  submitRequest(payload, '3-sandbox');
};

const processSubmitAdhoc = function() {
  // With ad hoc spaces, the user is always create the space for him/herself
  user = currentUser;

  if ($.trim(adhocTextbox.val()) === '') {
    alert('The Name of Space must not be empty');
    return;
  }

  showStep('4');
  const payload = initPayload();

  payload[`selected_course_adhoc_${timeId}`] = `adhoc-${payload.username}-${timeId}-${adhocTextbox.val()}`;

  // NOTE: The adhoc form fields are in step 1
  submitRequest(payload, '1');
};

var submitRequest = function(payload, destinationOnFailure) {
  const request = $.post('/sfu/course/create', payload);
  request.done(function(data) {
    if (data.success) {
      showStep('5');
    } else {
      $.flashError(`Course request failed: ${data.message} Please try again.`);
      showStep(destinationOnFailure);
    }
  });
  request.fail(function() {
    console.log(request);
    $.flashError('The course request cannot be processed at this time. Please try again.');
    showStep(destinationOnFailure);
  });
};

const processFaculty = function(action) {
  const userId = userIdTextbox.val();
  const validUserId = /^[a-z_0-9]+$/;

  if (action === 'action-identify-faculty-delegate') {
    if (!validUserId.test(userId)) {
      alert('Instructor Computer ID contains invalid characters. Please correct it before continuing.');
      return;
    }
    user = new User(userId);
    user.fetch();
  } else {
    user = currentUser;
  }

  if (user.hasLoaded) {
    showFacultyStep();
  } else {
    showStep('2-loading');
  }

  $(document).one('userloaded', () => showFacultyStep());

  $(document).one('userloaderror', function() {
    // deregister the successful event listener to avoid duplicates later
    $(document).off('userloaded');
    // bring user to a previous step to allow for correction
    if (action === 'action-identify-faculty-delegate') {
      // user was creating for someone else
      alert('Instructor Computing ID is invalid. Please double check before continuing.');
      showDelegateStep();
    } else {
      // user was creating for him/herself; this error is unlikely, but we handle it anyway
      alert('Your Computing ID is invalid. Please contact Canvas help.');
      showStep('1');
    }
  });
};

var showFacultyStep = function() {
  $('.username-display').text(getUsernameToDisplay());
  $('#sandbox-name-display').text(`Sandbox - ${user.get('sfu_id')} - ${timeId}`);
  getCourses();
  getSandboxes();
  showStep('2-faculty');
};

var showDelegateStep = function() {
  showStep('1-delegate');
  userIdTextbox.focus();
};

const showNonCalendarStep = function() {
  showStep('3-non_calendar');
  nonCalendarCourseTextbox.focus();
};

var showStep = function(name) {
  // hide all steps, then only show the specified one
  $('section.step').hide();
  $(`#step-${name}`).show();
};

const handleActionClick = function(event) {
  event.preventDefault();
  const action = $(this).attr('id');
  switch (action) {
    case 'action-identify-student':
      showStep('2-student');
      break;
    case 'action-identify-faculty-delegate-pending':
      showDelegateStep();
      break;
    case 'action-identify-faculty-delegate':
    case 'action-identify-faculty':
      processFaculty(action);
      break;
    case 'action-course-calendar':
      showStep('3-calendar');
      break;
    case 'action-course-non_calendar':
      showNonCalendarStep();
      break;
    case 'action-course-sandbox':
      showStep('3-sandbox');
      break;
  // submit actions
    case 'action-submit-calendar':
      processSubmitCalendar();
      break;
    case 'action-submit-non_calendar':
      processSubmitNonCalendar();
      break;
    case 'action-submit-sandbox':
      processSubmitSandbox();
      break;
    case 'action-submit-adhoc':
      processSubmitAdhoc();
      break;
  // back actions
    case 'action-back-faculty-delegate':
      showStep('1');
      break;
    case 'action-back-calendar':
    case 'action-back-non_calendar':
    case 'action-back-sandbox':
      showStep('2-faculty');
      break;
  // redirect actions
    case 'action-go-dashboard':
      window.location = '/';
      break;
    case 'action-go-course_list':
      window.location = '/courses';
      break;
    case 'action-go-start_over':
    case 'action-go-start_over-sidebar':
      window.location.reload();
      break;
    case 'action-open-help':
      window.open('https://www.sfu.ca/cee/services/learning-and-teaching-technology.html', '_blank');
      break;
  }
};

// create relevant labels for the calendar course submit button
const updateCalendarSubmitButton = function() {
  const button = $('#action-submit-calendar');
  if (crosslistCheckbox.prop('checked')) {
    button.text('Create Single Cross-listed Course');
  } else {
    button.text(selectedCourseList.length <= 1 ? 'Create Course' : 'Create Courses');
  }
};

const handleSelectedCourseListChange = function() {
  // update the course list
  selectedCourseListView.render();
  updateCalendarSubmitButton();
  let canCrosslist = true;
  // one can only cross-list more than one course
  canCrosslist &= selectedCourseList.length > 1;
  // one can only cross-list courses from the same term
  canCrosslist &= selectedCourseList.terms().length === 1;
  if (canCrosslist) {
    // only enable cross-list checkbox if cross-listing is possible/logical
    crosslistCheckbox.removeAttr('disabled');
    // when cross-listing, show concatenated course name
    const names = selectedCourseList.map(course => `${course.get('name')}${course.get('number')} - ${course.get('section')}`);
    crosslistTitle.text(`The new course will be called: ${names.join(' / ')}`);
  } else {
    crosslistCheckbox.attr('disabled', 'disabled').prop('checked', false).triggerHandler('change');
    crosslistTitle.text('No cross-list');
  }
};

$(document).ready(function() {

  ReactDOM.render(
    React.createElement(
      SFUCopyrightComplianceNotice,
      { className: 'sfu-ic-wizard-box__message-text__copyright_compliance' }
    ),
    document.getElementsByClassName('copyright')[0]
  );

  // attach behavior to action links
  $('button.action').bind('click', handleActionClick);

  // extract master "terms" list from the HTML drop-down menu
  searchTermSelect = $('#sel-search-term');
  searchTermSelect.children('option').each(function() {
    terms.add(new Term({
      sis_source_id: $(this).attr('value'),
      name: $(this).text()
    }));
  });

  // pre-fetch the current user
  userIdTextbox = $('#txt-user_id');
  userIdTextbox.bind('keydown', function(event) {
    // make RETURN/ENTER key trigger the next step
    if (event.which === 13) { processFaculty('action-identify-faculty-delegate'); }
  });
  const currentUserId = userIdTextbox.data('default');
  currentUser = new User(currentUserId);
  currentUser.fetch();

  enrollMeCheckbox = $('#chk-enroll_me');
  enrollMeAsSelect = $('#sel-enroll_me_as');

  nonCalendarCourseTextbox = $('#txt-course_name');
  nonCalendarCourseTextbox.bind('keydown', function(event) {
    // make RETURN/ENTER key trigger the next step
    if (event.which === 13) { processSubmitNonCalendar(); }
  });
  nonCalendarTermSelect = $('#sel-term');

  adhocTextbox = $('#txt-adhoc_name');
  adhocTextbox.bind('keydown', function(event) {
    // make RETURN/ENTER key trigger the next step
    if (event.which === 13) { processSubmitAdhoc(); }
  });

  showStep('1');

  searchedCourseListView = new SelectableCourseListView({
    collection: searchedCourseList,
    el: $('#courses-searched')
  });

  // hide the list initially because it's empty
  $(searchedCourseListView.el).hide();
  searchedCourseListView.collection.on('add', function() {
    searchedCourseListView.render();
    $(searchedCourseListView.el).show();
  });

  // only show cross-list title if cross-listing courses
  crosslistTitle = $('#crosslist-title');
  crosslistTitle.hide();
  crosslistCheckbox = $('#chk-crosslist');
  crosslistCheckbox.bind('change', function() {
    updateCalendarSubmitButton();
    if ($(this).prop('checked')) {
      crosslistTitle.show();
    } else {
      crosslistTitle.hide();
    }
  });

  selectedCourseListView = new CourseListView({
    collection: selectedCourseList,
    el: $('#courses-selected')
  });

  selectedCourseListView.collection.on('add', handleSelectedCourseListChange);
  selectedCourseListView.collection.on('remove', handleSelectedCourseListChange);
  handleSelectedCourseListChange();

  $(document).bind('selectablecoursechange', function(event, course, isSelected) {
    if (isSelected) {
      selectedCourseList.add(course);
    } else {
      selectedCourseList.remove(course);
    }
  });

  $('#search').autocomplete({
    source: function(request, response) {
      $.ajax({
        url: `/sfu/api/v1/course-data/${searchTermSelect.val()}/${request.term}`,
        dataType: 'json',
        success: function(data) {
          const suggestions = $.map(data.slice(0, 10), item => {
            return $.extend(item, {
              label: item.display,
              value: item.sis_source_id,
            });
          });
          response(suggestions);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          console.log(`Error getting course list: ${errorThrown}`);
        }
      });
    },
    minLength: 3,
    focus: function(event, ui) {
      // make sure the search field still shows the label (instead of the underlying value)
      $(this).val(ui.item.label);
      return false;
    },
    select: function(event, ui) {
      // manually create the course using metadata from the selected item
      const course = new Course({
        key: ui.item.key,
        name: ui.item.name,
        number: ui.item.number,
        peopleSoftCode: ui.item.term,
        section: ui.item.section,
        sis_source_id: ui.item.sis_source_id,
        title: ui.item.title,
        sections: [],
        sectionCode: ''
      }); // NOTE: this field is not available with this API call

      // Check if this course has sections. If it does, update the course
      $.ajax({
        url: `/sfu/api/v1/amaint/course/${ui.item.key}/sections`,
        dataType: 'json',
        success: function(data) { course.addSections(data.sections); }
      });

      // Check if this course is already in Canvas. If it is, the call will be successful. Otherwise, we'll get a 404.
      $.ajax({
        url: `/sfu/api/v1/course/${ui.item.sis_source_id}`,
        dataType: 'json',
        success: function() {
          alert(`${course.displayName()} already exists in Canvas, and cannot be added again.`);
        },
        error: function() { // course doesn't already exist in Canvas (NOTE: we expect a 404 here to indicate such condition)
          // ignore this course if it's already in the search results; we don't want duplicates
          if (searchedCourseList.has(course)) { return; }

          // attach the corresponding term to the course
          course.term = _.first(terms.where({sis_source_id: ui.item.term}));

          // again, we don't want duplicates between search results and Suggested Courses
          if (course.term.courses.has(course)) {
            alert(`${course.displayName()} is already in your Suggested Courses. Please use that instead.`);
            return;
          }

          // now it's sane to add it to the search results
          searchedCourseList.add(course);
        }
      });

      // empty the search field and cancel the event to prevent value from getting changed
      $(this).val('');
      return false;
    }
  });
});
