import React from 'react'
import PropTypes from 'prop-types'

const SFUGoogleDocsStudentPrivacyNotice = ({ alertStyle }) => {
  const alertClassName = `SFUPrivacyNotice ${alertStyle}`
  return (
    <div className={alertClassName} >
      <h1><i className="icon-warning" /> Is your Google Docs usage privacy compliant?</h1>
      <p>
        Google Docs is a collaboration tool that allows you to create and share documents with other people. <strong>Before using Google Docs</strong>, carefully review the <a href="http://www.sfu.ca/canvasprivacynotice" target="_blank" rel="noreferrer noopener">Canvas Privacy Protection Notice</a> to <strong>understand the personal privacy implications</strong> for yourself <strong>as well as your responsibilities to other persons</strong> and their information.
      </p>
      <p>
        By authorizing your SFU Canvas account to use Google Docs, you acknowledge that you read and are agreeing to the Privacy Protection Notice.
      </p>
    </div>
  )
}

SFUGoogleDocsStudentPrivacyNotice.propTypes = {
  alertStyle: PropTypes.string.isRequired
}

const SFUPrivacyNotice = ({ usage, alertStyle }) => {
  const getString = (string) => {
    const GOOGLE_DOCS = 'Google Docs'
    const strings = {
      h1_usage: {
        external_apps: 'app',
        google_docs: `${GOOGLE_DOCS} usage`
      },
      before_using: {
        external_apps: 'any app',
        google_docs: GOOGLE_DOCS
      },
      cee_will_help: {
        external_apps: 'complete an app privacy assessment and, if needed, advise you how to obtain students’ consent in the manner prescribed by law',
        google_docs: 'with the student consent procedure that you must use'
      },
      by_using_in_course: {
        external_apps: 'using apps in your course and the App Centre in Canvas',
        google_docs: `authorizing your SFU Canvas account to use ${GOOGLE_DOCS} in your course`
      }
    }
    // TODO this should throw a runtime warning instead of returning an empty string
    return (
      Object.prototype.hasOwnProperty.call(strings, string) &&
      Object.prototype.hasOwnProperty.call(strings[string], usage)) ?
      strings[string][usage] : ''
  }

  const alertClassName = `SFUPrivacyNotice ${alertStyle}`

  if (usage === 'google_docs_student') {
    return <SFUGoogleDocsStudentPrivacyNotice alertStyle={alertStyle} />
  }

  return (
    <div className={alertClassName}>
      <h1><i className="icon-warning" /> Is your {getString('h1_usage')} privacy compliant?</h1>
      <p>
        There are <strong> personal legal consequences</strong> if you use an app that discloses and stores students&rsquo; personal information elsewhere inside or outside Canada without their consent. Unauthorized disclosure is a privacy protection offense under BC law. Employees and SFU are liable to investigation and possible fines.
      </p>
      <p>
        <strong>Before using {getString('before_using')}</strong>, carefully review the complete <a href="http://www.sfu.ca/canvasprivacynotice" target="_blank" rel="noreferrer noopener"> Canvas Privacy Protection Notice</a> to <strong>understand your legal responsibilities</strong> and please contact the <a href="https://www.sfu.ca/cee/about/contact.html" target="_blank">Centre for Educational Excellence (CEE)</a>. The Learning Technology Specialists in CEE will help you {getString('cee_will_help')}.
      </p>
      <p>
        By {getString('by_using_in_course')}, you acknowledge that you have <strong>read the <a href="http://www.sfu.ca/canvasprivacynotice" target="_blank" rel="noreferrer noopener">Canvas Privacy Protection Notice</a></strong> and will <strong>follow the described protection of privacy requirements and procedure</strong>.
      </p>
    </div>
  )
}

SFUPrivacyNotice.propTypes = {
  alertStyle: PropTypes.string.isRequired,
  usage: PropTypes.string.isRequired
}

export default SFUPrivacyNotice
