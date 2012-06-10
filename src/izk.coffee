round = (num, dec = 2) ->
  pow = Math.pow(10, dec)
  Math.round(num * pow) / pow

isNaN = (obj) ->
  obj isnt obj



class Mark
  constructor: (@points, @outOf, @source = null) ->
    if isNaN(@points) or isNaN(@outOf)
      throw new Error "#{@toString()} is not a valid mark"

  percents: ->
    round @points / @outOf * 100

  grades:
    1: 90
    2: 75
    3: 60
    4: 45
    5: 0

  grade: ->
    percents = @percents()
    for grade, min of @grades
      return grade if percents >= min

  valueOf: ->
    [@points, @outOf]

  toString: ->
    "#{@points}/#{@outOf}"

  toFullString: ->
    "#{@toString()} #{@percents()}% (#{@grade()})"



class MarkList
  constructor: (marks = []) ->
    @marks = []
    marks.forEach @push

  push: (mark) =>
    if Array.isArray mark
      mark = new Mark(mark[0], mark[1], mark[2])

    if not mark instanceof Mark
      throw new Error "#{mark} is not instance of Mark"

    @marks.push mark

  all: -> @marks

  reset: ->
    @marks = []

  get: (i) -> @marks[i]

  empty: ->
    @marks.length is 0

  total: ->
    sum = {points: 0, outOf: 0}

    for {points, outOf} in @marks
      sum.points += points
      sum.outOf += outOf

    if sum.outOf > 0
      new Mark(sum.points, sum.outOf)
    else
      null

  toString: ->
    '[' + @marks.map((mark) -> mark.toString()).join(' ') + ']'



parse = do ->
  
  MARK = ///
    (
      \d*[\.,]?\d+ | # number
      [\?N\.] | # unknown
      \.{3}
    )
    /
    (\d*[\.,]?\d+)b?
  ///

  FINAL = /\[\d\]/

  DELIMITER = /,? /

  float = (number) ->
    parseFloat number.replace ',', '.'

  (text) ->
    marks = new MarkList

    for chunk in text.trim().split DELIMITER

      if FINAL.test chunk
        marks.reset()

      else if match = MARK.exec chunk
        points = float match[1]
        outOf = float match[2]

        try
          marks.push [points, outOf, match[0]]
        catch error
          continue

    marks



render = do ->

  FINAL = /<img src="\.\.\/z(\d)\.gif"[^>]*>/g
  SUB = /<img src="\.\.\/s(\d)\.gif"[^>]*>/g

  getMarks = ($el) ->
    parse $el.html().replace(FINAL, '[$1]').replace(SUB, '($1)')

  addTitles = ($el, marks) ->
    html = $el.html()

    $el.html marks.all().reduce (html, mark) ->
      html.replace mark.source, "<span title=\"#{mark.toFullString()}\">#{mark.source}</span>"
    , html

  appendTotal = ($el, marks) ->
    $el.append " ~ <u>#{marks.total().toFullString()}</u>"

  ($elements) ->
    for $el in $elements
      marks = getMarks $el
      continue if marks.empty()
      addTitles $el, marks
      appendTotal $el, marks



if window? # browser environment
  elements = $ 'td.quote3[width!="190"]'
  render elements.map(-> $ this).get()
else
  exports.Mark = Mark
  exports.MarkList = MarkList
  exports.parse = parse
  exports.render = render
