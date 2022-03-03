# this CANVAS_ZEITWERK constant flag is defined in canvas' "application.rb"
# from an env var. It should be temporary,
# and removed once we've fully upgraded to zeitwerk autoloading.
if defined?(CANVAS_ZEITWERK) && CANVAS_ZEITWERK
  Rails.autoloaders.each do |autoloader|
    autoloader.inflector.inflect(
      "rest" => "REST",
      "sfu" => "SFU"
    )
  end
end
