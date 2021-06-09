/*
 * Copyright (C) 2021 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import I18n from 'i18n!dashboard_pages_ResourcesPage'
import React, {useState} from 'react'
import PropTypes from 'prop-types'
import StaffContactInfoLayout from './StaffContactInfoLayout'
import useImmediate from '@canvas/use-immediate-hook'
import {fetchCourseInstructors, fetchCourseApps} from '@canvas/k5/react/utils'
import AppsList from '@canvas/k5/react/AppsList'
import {showFlashError} from '@canvas/alerts/react/FlashAlert'

const fetchStaff = cards =>
  Promise.all(cards.filter(c => c.isHomeroom).map(course => fetchCourseInstructors(course.id)))
    .then(instructors => instructors.flat(1))
    .then(instructors =>
      instructors.reduce((acc, instructor) => {
        if (!acc.find(({id}) => id === instructor.id)) {
          acc.push({
            id: instructor.id,
            name: instructor.short_name,
            bio: instructor.bio,
            avatarUrl: instructor.avatar_url || undefined,
            role: instructor.enrollments[0].role
          })
        }
        return acc
      }, [])
    )

const fetchApps = cards => {
  const courseIds = cards.filter(c => !c.isHomeroom).map(c => c.id)
  if (!courseIds.length) return Promise.resolve([])
  return fetchCourseApps(courseIds).then(apps =>
    // Combine LTIs into a unique set each containing a list of
    // the courses with which they are associated
    apps.reduce((acc, app) => {
      const course = {id: app.context_id, name: app.context_name}
      const existing = acc.find(({id}) => id === app.id)
      if (existing) {
        existing.courses.push(course)
      } else {
        acc.push({
          id: app.id,
          courses: [course],
          title: app.course_navigation.text || app.name,
          icon: app.course_navigation.icon_url || app.icon_url
        })
      }
      return acc
    }, [])
  )
}

export default function ResourcesPage({cards, cardsSettled, visible}) {
  const [apps, setApps] = useState([])
  const [staff, setStaff] = useState([])
  const [staffAuthorized, setStaffAuthorized] = useState(true)
  const [isAppsLoading, setAppsLoading] = useState(false)
  const [isStaffLoading, setStaffLoading] = useState(false)

  useImmediate(
    () => {
      if (cards && cardsSettled) {
        setAppsLoading(true)
        fetchApps(cards)
          .then(data => {
            setApps(data)
            setAppsLoading(false)
          })
          .catch(err => {
            setAppsLoading(false)
            showFlashError(I18n.t('Failed to load apps.'))(err)
          })

        setStaffLoading(true)
        fetchStaff(cards)
          .then(setStaff)
          .catch(err => {
            if (err?.response?.status === 401) {
              return setStaffAuthorized(false)
            }
            showFlashError(I18n.t('Failed to load staff.'))(err)
          })
          .finally(() => setStaffLoading(false))
      }
    },
    [cards, cardsSettled],
    {deep: true}
  )

  return (
    <section style={{display: visible ? 'block' : 'none'}} aria-hidden={!visible}>
      <AppsList isLoading={isAppsLoading} apps={apps} />
      {staffAuthorized && <StaffContactInfoLayout isLoading={isStaffLoading} staff={staff} />}
    </section>
  )
}

ResourcesPage.propTypes = {
  cards: PropTypes.array.isRequired,
  cardsSettled: PropTypes.bool.isRequired,
  visible: PropTypes.bool.isRequired
}
