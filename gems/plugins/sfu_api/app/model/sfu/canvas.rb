require "httpclient"

module SFU
  class Canvas
    class << self
      def sis_import(csv_data)
        auth_header = "Bearer #{REST.canvas_oauth_token}"
        client = HTTPClient.new
        client.post REST.canvas_sis_import_url, csv_data, { 'Authorization' => auth_header, 'Content-Type' => 'text/csv'}
      end
    end
  end
end
