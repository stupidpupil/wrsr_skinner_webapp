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
      resize_to_fit(512,512).
      to_blob {|b| b.format = 'jpg'}
  end


  # These constraints are meant to prevent serving any bundle
  # whose generation seems to have gone badly wrong
  BundleMaxFileCount = 200
  BundleMaxSizeBytes = 100*1024*1024
  BundleZipMaxSizeBytes = 60*1024*2024

  get '/bundle' do

    brand = brand_from_hash(params)

    zip_io = StringIO.new

    Dir.mktmpdir() do |temp_dir|
      skinnables = WRSRSkinner::Skinnable.all(temp_dir)

      Parallel.each(skinnables,  in_processes: 4) {|s| s.save_textures_with_brand(brand)}

      files_to_be_zipped = Dir[ File.join( temp_dir, "**", "**" ) ]

      break if files_to_be_zipped.count > BundleMaxFileCount
      files_to_be_zipped_size = files_to_be_zipped.map {|f| File.file?(f) ? File.size(f) : 0 }.inject(:+)
      break if files_to_be_zipped_size > BundleMaxSizeBytes

      Zip::File.open_buffer(zip_io) do |zip_file|
        files_to_be_zipped.each do |file|
          zip_file.add( file.sub( "#{ temp_dir }/", "" ), file )
        end
      end
      
    end

    if zip_io.length == 0 or zip_io.length > BundleZipMaxSizeBytes
      status 500
      content_type 'txt'
      return "Bundle constraints violated"
    end

    zip_io.rewind
    ret = zip_io.read
    zip_io.close

    content_type 'zip'
    attachment 'bundle.zip'
    ret
  end


  run! if app_file == $0
end