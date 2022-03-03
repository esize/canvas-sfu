module SFU
  class Course
    class << self
      def terms(sfuid)
        terms = REST.json REST.terms_url, "&username=#{sfuid}"
        if terms == 404 || terms.blank? || !terms.has_key?("teachingSemester")
          404
        elsif terms == 500
          500
        else
          terms["teachingSemester"]
        end
      end

      def for_instructor(sfuid, term_code = nil)
        terms(sfuid).map do |term|
          if term_code.nil?
            courses = REST.json REST.courses_url, "&username=#{sfuid}&term=#{term["peopleSoftCode"]}"
            courses["teachingCourse"]
          else
            if term["peopleSoftCode"] == term_code
              courses = REST.json REST.courses_url, "&username=#{sfuid}&term=#{term["peopleSoftCode"]}"
              courses["teachingCourse"]
            end
          end
        end
      end

      def info(course, term)
        REST.json REST.course_info_url, "&course=#{course}&term=#{term}"
      end

      def sections_exists?(json_data, section)
        json_data.any? do |info|
          info["course"]["section"].to_s.downcase.eql?(section)
        end
      end

      def have_tutorials?(json_data, associated_class)
        json_data.any? do |info|
          class_type = info["course"]["classType"].to_s.downcase
          section_code = info["course"]["sectionCode"].to_s.downcase
          associated_class == info["course"]["associatedClass"] && class_type.eql?("n") && section_code.eql?("tut")
        end
      end

      def have_labs?(json_data, associated_class)
        json_data.any? do |info|
          class_type = info["course"]["classType"].to_s.downcase
          section_code = info["course"]["sectionCode"].to_s.downcase
          associated_class == info["course"]["associatedClass"] && class_type.eql?("n") && section_code.eql?("lab")
        end
      end

      def is_enrollment_section?(json_data, section)
        json_data.any? do |info|
          info["course"]["section"].to_s.downcase.eql?(section) && info["course"]["classType"].to_s.downcase.eql?("e")
        end
      end

      def associated_class_for_section(json_data, section)
        associated_class = nil
        json_data.each do |info|
          associated_class = info["course"]["associatedClass"] if info["course"]["section"].to_s.downcase.eql?(section)
        end
        associated_class
      end

      def sections(course_code, term_code, section)
        details = info(course_code, term_code)
        raise "Course info REST API call returned non-array: #{details.inspect}" unless details.is_a?(Array)

        sections = []
        sections << section.upcase if sections_exists?(details, section)

        if details.present? && is_enrollment_section?(details, section)
          associated_class = associated_class_for_section(details, section)
          details.each do |info|
            class_type = info["course"]["classType"].to_s.downcase
            if class_type.eql?("n") && associated_class == info["course"]["associatedClass"]
              sections << info["course"]["section"]
            end
          end
        end

        sections
      end

      # NOTE: This has been superseded by #sections, and may be removed in the future.
      def section_tutorials(course_code, term_code, section)
        details = info(course_code, term_code)
        sections = []
        has_no_child_sections = true

        if details != "[]" && is_enrollment_section?(details, section)
          associated_class = associated_class_for_section(details, section)
          have_tutorials = have_tutorials?(details, associated_class)
          have_labs = have_labs?(details, associated_class)

          details.each do |info|
            class_type = info["course"]["classType"]
            section_code = info["course"]["sectionCode"].to_s.downcase

            if class_type.eql?("n") && associated_class == info["course"]["associatedClass"]
              if have_tutorials && have_labs
                # Only return tutorials for enrollment sections that have both labs and tutorials
                sections << info["course"]["section"] if section_code.eql?("tut")
                has_no_child_sections = false
              else
                sections << info["course"]["section"]
                has_no_child_sections = false
              end
            end
          end
        end

        # Return main section e.g. d100 only for courses with no tutorial/lab sections
        sections << section.upcase if has_no_child_sections && sections_exists?(details, section)

        sections
      end

      def title(course_code, term_code, section)
        details = info(course_code, term_code)
        title = nil
        if details == 500
          title = 500
        elsif details == 404
          title == 404
        elsif details != "[]"
          details.each do |info|
            section = info["course"]["section"].downcase
            title = info["course"]["title"] if section.eql? section.downcase
          end
        end
        title
      end

    end
  end
end
