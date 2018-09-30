class TestsWarpController < WarpCable::Controller
  skip_before_action :verify_authenticity_token, raise: false
	before_action :example, only: :play
  def example(params)
    yield "i dunno, #{params[:x]}, #{params[:y]}"
  end

  def play
    "do_stuff"
    # render_json "its really unclear"
  end
end