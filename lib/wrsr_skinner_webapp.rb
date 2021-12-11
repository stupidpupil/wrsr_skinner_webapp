require "sinatra/base"
require "sinatra/reloader"
require "rack/throttle"
require 'tmpdir'
require 'parallel'
require 'zip'

require "wrsr_skinner"

class MyApp < Sinatra::Base
  configure :development do
    register Sinatra::Reloader
  end

  use Rack::Throttle::Second,   :max => 5

  set :public_folder, __dir__ + '/../static'

  get '/' do
    send_file File.expand_path('index.html', settings.public_folder)
  end

  def transform_brand_color(color)
    color = color.to_s unless color.is_a? String 
    color.downcase!
    return '#FF00FFFF' unless color =~ /\A#[0-9a-f]{8}\Z/
    return 'transparent' if color[-2..-1] == "00"
    return color
  end

  def brand_from_hash(brand_hash)
    WRSRSkinner::Brand.new(
      {logo:'transparent'}.merge(brand_hash).map {|k,v| [k, k == 'logo_name' ? v : transform_brand_color(v)]}.to_h, 
    )
  end

  get '/preview/:skinnable/:texture' do
    skinnables = WRSRSkinner::Skinnable.all
    status 404 unless skinnable = skinnables.find {|s| s.skinnable_wrsr_path == params['skinnable'] }
    status 404 unless texture = skinnable.texture_wrappers[params['texture']]
    return unless texture

    brand = brand_from_hash(params)

    content_type 'jpg'
    texture.
      texture_with_brand(brand).
      resize_to_fit(1024,1024).
      to_blob {|b| b.format = 'jpg'}
  end


  # This constraint are meant to prevent serving any bundle
  # whose generation seems to have gone badly wrong
  BundleZipMaxSizeBytes = 60*1024*2024

  get '/bundle' do

    brand = brand_from_hash(params)

    mod_wrapper = WRSRSkinner::ModWrapper.new(['open_ifa_w50'], brand)
    zip_io = mod_wrapper.zip_io

    if zip_io.length == 0 or zip_io.length > BundleZipMaxSizeBytes
      zip_io.close
      status 500
      content_type 'txt'
      return "Bundle constraints violated"
    end

    ret = zip_io.read
    zip_io.close

    content_type 'zip'
    attachment 'bundle.zip'
    ret
  end

  run! if app_file == $0
end