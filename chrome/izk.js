(function() {
  var Mark, MarkList, elements, isNaN, parse, render, round,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  round = function(num, dec) {
    var pow;
    if (dec == null) dec = 2;
    pow = Math.pow(10, dec);
    return Math.round(num * pow) / pow;
  };

  isNaN = function(obj) {
    return obj !== obj;
  };

  Mark = (function() {

    function Mark(points, outOf, source) {
      this.points = points;
      this.outOf = outOf;
      this.source = source != null ? source : null;
      if (isNaN(this.points) || isNaN(this.outOf)) {
        throw new Error("" + (this.toString()) + " is not a valid mark");
      }
    }

    Mark.prototype.percents = function() {
      return round(this.points / this.outOf * 100);
    };

    Mark.prototype.grades = {
      1: 90,
      2: 75,
      3: 60,
      4: 45,
      5: 0
    };

    Mark.prototype.grade = function() {
      var grade, min, percents, _ref;
      percents = this.percents();
      _ref = this.grades;
      for (grade in _ref) {
        min = _ref[grade];
        if (percents >= min) return grade;
      }
    };

    Mark.prototype.valueOf = function() {
      return [this.points, this.outOf];
    };

    Mark.prototype.toString = function() {
      return "" + this.points + "/" + this.outOf;
    };

    Mark.prototype.toFullString = function() {
      return "" + (this.toString()) + " " + (this.percents()) + "% (" + (this.grade()) + ")";
    };

    return Mark;

  })();

  MarkList = (function() {

    function MarkList(marks) {
      if (marks == null) marks = [];
      this.push = __bind(this.push, this);
      this.marks = [];
      marks.forEach(this.push);
    }

    MarkList.prototype.push = function(mark) {
      if (Array.isArray(mark)) mark = new Mark(mark[0], mark[1], mark[2]);
      if (!mark instanceof Mark) {
        throw new Error("" + mark + " is not instance of Mark");
      }
      return this.marks.push(mark);
    };

    MarkList.prototype.all = function() {
      return this.marks;
    };

    MarkList.prototype.reset = function() {
      return this.marks = [];
    };

    MarkList.prototype.get = function(i) {
      return this.marks[i];
    };

    MarkList.prototype.empty = function() {
      return this.marks.length === 0;
    };

    MarkList.prototype.total = function() {
      var outOf, points, sum, _i, _len, _ref, _ref2;
      sum = {
        points: 0,
        outOf: 0
      };
      _ref = this.marks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref2 = _ref[_i], points = _ref2.points, outOf = _ref2.outOf;
        sum.points += points;
        sum.outOf += outOf;
      }
      if (sum.outOf > 0) {
        return new Mark(sum.points, sum.outOf);
      } else {
        return null;
      }
    };

    MarkList.prototype.toString = function() {
      return '[' + this.marks.map(function(mark) {
        return mark.toString();
      }).join(' ') + ']';
    };

    return MarkList;

  })();

  parse = (function() {
    var DELIMITER, FINAL, MARK, float;
    MARK = /(\d*[\.,]?\d+|[\?N\.]|\.{3})\/(\d*[\.,]?\d+)b?/;
    FINAL = /\[\d\]/;
    DELIMITER = /,? /;
    float = function(number) {
      return parseFloat(number.replace(',', '.'));
    };
    return function(text) {
      var chunk, marks, match, outOf, points, _i, _len, _ref;
      marks = new MarkList;
      _ref = text.trim().split(DELIMITER);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        chunk = _ref[_i];
        if (FINAL.test(chunk)) {
          marks.reset();
        } else if (match = MARK.exec(chunk)) {
          points = float(match[1]);
          outOf = float(match[2]);
          try {
            marks.push([points, outOf, match[0]]);
          } catch (error) {
            continue;
          }
        }
      }
      return marks;
    };
  })();

  render = (function() {
    var FINAL, SUB, addTitles, appendTotal, getMarks;
    FINAL = /<img src="\.\.\/z(\d)\.gif"[^>]*>/g;
    SUB = /<img src="\.\.\/s(\d)\.gif"[^>]*>/g;
    getMarks = function($el) {
      return parse($el.html().replace(FINAL, '[$1]').replace(SUB, '($1)'));
    };
    addTitles = function($el, marks) {
      var html;
      html = $el.html();
      return $el.html(marks.all().reduce(function(html, mark) {
        return html.replace(mark.source, "<span title=\"" + (mark.toFullString()) + "\">" + mark.source + "</span>");
      }, html));
    };
    appendTotal = function($el, marks) {
      return $el.append(" ~ <u>" + (marks.total().toFullString()) + "</u>");
    };
    return function($elements) {
      var $el, marks, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = $elements.length; _i < _len; _i++) {
        $el = $elements[_i];
        marks = getMarks($el);
        if (marks.empty()) continue;
        addTitles($el, marks);
        _results.push(appendTotal($el, marks));
      }
      return _results;
    };
  })();

  if (typeof window !== "undefined" && window !== null) {
    elements = $('td.quote3[width!="190"]');
    render(elements.map(function() {
      return $(this);
    }).get());
  } else {
    exports.Mark = Mark;
    exports.MarkList = MarkList;
    exports.parse = parse;
    exports.render = render;
  }

}).call(this);
