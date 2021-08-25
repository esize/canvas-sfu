# frozen_string_literal: true

#
# Copyright (C) 2019 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

class DynamoConnection < GraphQL::Pagination::Connection
  def cursor_for(item)
    encode(item[items.sort_key])
  end

  def has_next_page
    !!items.query.last_evaluated_key
  end

  def has_previous_page
    false
  end

  def nodes
    first ?
      sliced_nodes.limit(first) :
      sliced_nodes
  end

  private

  def sliced_nodes
    items.after(after ? decode(after) : nil)
  end
end
