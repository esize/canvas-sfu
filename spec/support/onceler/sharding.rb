# frozen_string_literal: true

#
# Copyright (C) 2014 - present Instructure, Inc.
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

module Onceler
  module Sharding
    def self.included(klass)
      klass.before :record do
        sharding_failed = Switchman::RSpecHelper.class_variable_get(:@@sharding_failed)
        raise "Sharding did not set up correctly" if sharding_failed

        @shard1 = Shard.find(Switchman::RSpecHelper.class_variable_get(:@@shard1).id)
        @shard2 = Shard.find(Switchman::RSpecHelper.class_variable_get(:@@shard2).id)
      end
    end
  end
end
