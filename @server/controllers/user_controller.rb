class UserController < ApplicationController
  respond_to :json

  caches_action :avatars, :cache_path => proc {|c|
    current_cache_key = Rails.cache.read("avatar-digest-#{current_subdomain.id}") || 0
    {:tag => "avatars-#{current_subdomain.id}-#{current_cache_key}-#{session[:search_bot]}"}
  }

  def index
    dirty_key "/users"
    render :json => []
  end

  def show
    if params[:id] == '-1'
      render :json => [{
               'key' => '/user/-1',
               'name' => 'anonymous',
               'avatar_file_name' => nil
             }]
      return
    end
    
    user = User.find(params[:id])
    dirty_key "/user/#{params[:id]}"
    render :json => []
  end

  def avatars
    if Rails.cache.read("avatar-digest-#{current_subdomain.id}").nil?
      Rails.cache.write("avatar-digest-#{current_subdomain.id}", 0)
    end
    
    # don't fetch avatars for search bots
    respond_to do |format|
      @user = User

      avatars = ''
      if !session[:search_bot]
        users = @user.where("registered=1 AND b64_thumbnail IS NOT NULL AND INSTR(active_in, '\"#{current_subdomain.id}\"')")
        avatars = users.select([:id,:b64_thumbnail]).map {|user| "#avatar-#{user.id} { background-image: url('#{user.b64_thumbnail}');}"}.join(' ')
      end
      format.json { 
        render :json => {
          key: '/avatars',
          avatars: avatars
        }
      }
    end
  end

end
