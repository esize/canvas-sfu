import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import SFUPrivacyNotice from '@sfu/sfu-pia-notice'

var showGoogleDocsWarning = function () {
  $.getJSON('/api/v1/courses/' + ENV.context_asset_string.split('_')[1] + '/enrollments?user_id=self', function (enrollments) {
    var usage = 'google_docs';

    if (enrollments.length > 0 && enrollments[0].role === 'StudentEnrollment') {
      usage = 'google_docs_student';
    }
    $('<div id="sfu-google-docs-pia-notice">').appendTo('#google_docs_description td');

    ReactDOM.render(
      React.createElement(
        SFUPrivacyNotice,
        {
          alertStyle: 'alert',
          usage: usage
        }
      ),
      document.getElementById('sfu-google-docs-pia-notice')
    );
  });
};

showGoogleDocsWarning()
