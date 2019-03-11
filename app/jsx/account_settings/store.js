/*
 * Copyright (C) 2018 - present Instructure, Inc.
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

import {createStore, applyMiddleware} from 'redux'
import ReduxThunk from 'redux-thunk'
import rootReducer from './reducers'
import axios from 'axios'
import {setupCache} from 'axios-cache-adapter'

export const defaultState = {
  cspEnabled: false,
  cspInherited: false,
  whitelistedDomains: {
    account: [],
    effective: [],
    tools: {}
  }
}

const cache = setupCache({
  maxAge: 0.5 * 60 * 1000 // Hold onto the data for 30 seconds
})

const api = axios.create({
  adapter: cache.adapter
})

export function configStore(initialState, options = {}) {
  const middleware = [
    ReduxThunk.withExtraArgument({axios: api}),
    process.env.NODE_ENV !== 'production' &&
      !options.disableLogger &&
      require('redux-logger').logger
  ].filter(Boolean)

  return createStore(rootReducer, initialState, applyMiddleware(...middleware))
}
