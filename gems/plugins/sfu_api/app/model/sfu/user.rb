module SFU
  class User
    class << self
      def roles(sfuid)
        account = REST.json REST.account_url, "&username=#{sfuid}"
        if account == 500
          roles = 500
        elsif account == 404 || account.nil?
          roles = 404
        else
          roles = account["roles"]
        end
        roles
      end

      def info(sfuid)
        REST.json(REST.account_url, "&username=#{sfuid}")
      end

      def belongs_to_maillist?(username, maillist)
        membership = REST.text(REST.maillist_membership_url, "&address=#{username}&listname=#{maillist}")
        !(membership == '""')
      end

    end
  end
end
