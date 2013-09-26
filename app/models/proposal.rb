class Proposal < ActiveRecord::Base
  has_many :points, :dependent => :destroy
  has_many :positions, :dependent => :destroy
  has_many :inclusions, :dependent => :destroy
  has_many :point_listings, :dependent => :destroy

  has_many :assessments, :through => :points, :dependent => :destroy
  has_many :claims, :through => :assessments, :dependent => :destroy

  belongs_to :user
  
  acts_as_tenant(:account)
  #attr_taggable :tags

  #acts_as_taggable

  is_trackable
  is_followable
  
  is_moderatable :text_fields => [:name, :description, :long_description], :moderatable_objects => lambda { Proposal.published }

  #before_save :extract_tags

  scope :active, where( :active => true, :published => true )
  scope :inactive, where( :active => false, :published => true )
  scope :open_to_public, where( :publicity => 2, :published => true )
  scope :privately_shared, where( 'publicity < 2')
  scope :public_fields, select('id, long_id, activity, additional_description2,category,created_at,contested,description,designator,additional_description1,additional_description3,name,trending,updated_at,url1,url2,user_id, active, top_pro, top_con, participants,publicity,published,slider_right,slider_left,considerations_prompt,slider_prompt')
  scope :unpublished, where( :published => false)
  scope :browsable, where( :targettable => false)

  def self.content_for_user(user)
    user.proposals.public_fields.all + Proposal.privately_shared.where("access_list like '%#{user.email}%' ").public_fields.all
  end

  def public?
    publicity == 2
  end


  def format_description
    return self.description.split('\n')
  end
  
  def reference
    return "#{category} #{designator}"
  end

  #returns the slug :long_id instead of :id when @proposal passed to e.g. proposal_path
  def to_param
    long_id
  end

  def title(max_len = 140)
    if name && name.length > 0
      my_title = name
    elsif description
      my_title = description
    else
      raise 'Name and description nil'
    end

    if my_title.length > max_len
      "#{my_title[0..max_len]}..."
    else
      my_title
    end
    
  end

  def title_with_hashtags(max_len = 140)

    def str_without_overlapping_tags(mystr, tags)
      tags.each do |tag|
        mystr << " #{tag}" unless mystr.index(tag)
      end
      mystr
    end

    def str_without_breaking_word(mystr, max_length)
      if mystr.length <= max_length
        mystr
      else
        mystr = mystr[0..max_length+1]        
        idx = mystr.rindex(' ')
        if idx
          mystr[0..idx]
        else
          ''
        end
      end
    end

    if name
      my_title = name
    elsif description
      my_title = description
    else
      raise 'Name and description nil'
    end

    tags = get_tags

    candidate = str_without_breaking_word(my_title, max_len - tags.join(' ').length - 1)
    str_without_overlapping_tags(candidate.strip, tags)  

  end

  def notable_points
    opposers = points.order('score_stance_group_0 + score_stance_group_1 + score_stance_group_2 DESC').limit(1).first
    supporters = points.order('score_stance_group_6 + score_stance_group_5 + score_stance_group_4 DESC').limit(1).first
    common = points.order('appeal DESC').limit(1).first

    if opposers && opposers.inclusions.count > 1 && \
       supporters && supporters.inclusions.count > 1 && \
       common && common.appeal > 0 && common.inclusions.count > 1
      {
        :important_for_opposers => opposers,
        :important_for_supporters => supporters,
        :common => common
      }
    else
      nil
    end
  end

  def stance_fractions
    distribution = Array.new(7,0)
    positions.published.select('COUNT(*) AS cnt, stance_bucket').group(:stance_bucket).each do |row|
      distribution[row.stance_bucket.to_i] = row.cnt.to_i
    end      
    total = distribution.inject(:+).to_f
    if total > 0     
      distribution.collect! { |stance_count| 100 * stance_count / total }
    end
    return distribution
  end

  def update_metrics
    self.num_points = points.count
    self.num_pros = points.pros.count
    self.num_cons = points.cons.count
    self.num_comments = 0
    self.num_inclusions = 0
    points.each do |pnt|
      self.num_comments += pnt.comments.count
      self.num_inclusions += pnt.inclusions.count
    end
    self.num_perspectives = positions.published.count
    self.num_unpublished_positions = positions.where(:published => false).count
    self.num_supporters = positions.published.where("stance_bucket > ?", 3).count
    self.num_opposers = positions.published.where("stance_bucket < ?", 3).count

    provocative = num_perspectives == 0 ? 0 : num_perspectives.to_f / (num_perspectives + num_unpublished_positions)

    latest_positions = positions.published.where(:created_at => 1.week.ago.beginning_of_week.advance(:days => -1)..1.week.ago.end_of_week).order('created_at DESC')    
    late_perspectives = latest_positions.count
    late_supporters = latest_positions.where("stance_bucket > ?", 3).count
    self.trending = late_perspectives == 0 ? 0 : Math.log2(late_supporters + 1) * late_supporters.to_f / late_perspectives

    # combining provocative and trending for now...
    self.trending = ( self.trending + provocative ) / 2

    self.activity = Math.log2(num_perspectives + 1) * Math.log2(num_comments + num_points + num_inclusions + 1)      

    polarization = num_perspectives == 0 ? 1 : num_supporters.to_f / num_perspectives - 0.5
    self.contested = -4 * polarization ** 2 + 1


    self.participants = positions(:select => [:user_id]).published.map {|x| x.user_id}.uniq.compact.to_s
    tc = points(:select => [:id]).cons.published.order('score DESC').limit(1)[0]
    tp = points(:select => [:id]).pros.published.order('score DESC').limit(1)[0]
    self.top_con = !tc.nil? ? tc.id : nil
    self.top_pro = !tp.nil? ? tp.id : nil

    self.save if changed?

  end

  def get_tags
    description.split.find_all{|word| /^#.+/.match word}
  end

  def extract_tags
    self.tags += get_tags
  end

  def add_long_id
    self.long_id = SecureRandom.hex(5)
    self.save
  end

  def self.add_long_id
    Proposal.where(:long_id => nil).each do |p|
      p.add_long_id
    end
  end

  def self.update_scores
    # for now, order by activity; later, incorporate trending    

    Proposal.active.each do |p|
      p.update_metrics
      p.save
    end

    true
  end

  # def has_admin_privilege(candidate_user, this_session_id, params)
  #   (session_id && this_session_id == session_id) || (!candidate_user.nil? && (candidate_user.id == user_id || candidate_user.is_admin?)) || (params.has_key?(:admin_id) && params[:admin_id] == admin_id)
  # end

end
