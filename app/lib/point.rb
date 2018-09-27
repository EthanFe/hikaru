class Point
  attr_reader :x, :y

  def initialize(x, y)
    @x = x
    @y = y
  end

  def ==(other)
    other.class == self.class && other.x == self.x && other.y == self.y
  end
end