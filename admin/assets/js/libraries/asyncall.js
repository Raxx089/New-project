function checkIfArray(n) {
  return "[object Array]" === Object.prototype.toString.call(n)
}

function checkIfNumber(n) {
  return "[object Number]" === Object.prototype.toString.call(n)
}

function checkIfObject(n) {
  return "[object Object]" === Object.prototype.toString.call(n)
}

function checkIfFunction(n) {
  return "[object Function]" === Object.prototype.toString.call(n)
}

function getReturnObj(n) {
  var r;
  return checkIfArray(n) ? r = [] : checkIfObject(n) && (r = {}), r
}

function getKeyQueue(n) {
  var r = [];
  for (var t in n) n.hasOwnProperty(t) && r.push(t);
  return r
}

function runInParallelLimit(n, r, t) {
  function e(r) {
    n[r].call(this, function(n, a) {
      if (n) {
        if (!o) return o = !0, t(n, null)
      } else {
        if (o) return;
        i++, u[r] = a;
        var f = c.pop();
        if (f) e(f);
        else if (i == l) return t(null, u)
      }
    })
  }
  if (n && r && checkIfNumber(r)) {
    var u = getReturnObj(n);
    if (u) {
      var c = getKeyQueue(n);
      if (0 == c.length) return t(u, null);
      var l = c.length,
        i = 0; - 1 == r && (r = l), r = Math.min(r, c.length);
      for (var a = 0; a < r; a++) {
        var f = c.pop();
        f && e(f)
      }
      var o = !1
    }
  }
}

function runInParallel(n, r) {
  runInParallelLimit(n, -1, r)
}

function runMapInParallelLimit(n, r, t, e) {
  function u(r) {
    t.call(this, n[r], function(n, t) {
      if (n) {
        if (!o) return o = !0, e(n, null)
      } else {
        if (o) return;
        a++, c[r] = t;
        var f = l.pop();
        if (f) u(f);
        else if (a == i) return e(null, c)
      }
    })
  }
  if (n && checkIfNumber(r) && t && checkIfFunction(t)) {
    var c = getReturnObj(n);
    if (c) {
      var l = getKeyQueue(n);
      if (0 == l.length) return e(c, null);
      var i = l.length,
        a = 0; - 1 == r && (r = i), r = Math.min(r, l.length);
      for (var f = 0; f < r; f++) u(l.pop());
      var o = !1
    }
  }
}

function runMapInParallel(n, r, t) {
  runMapInParallelLimit(n, -1, r, t)
}
