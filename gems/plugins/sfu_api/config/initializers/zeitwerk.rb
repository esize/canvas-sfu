Rails.autoloaders.each do |autoloader|
  autoloader.inflector.inflect(
    "rest" => "REST",
    "sfu" => "SFU"
  )
end
