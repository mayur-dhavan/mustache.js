require('./helper');
var Context = Mustache.Context;

describe('A new Mustache.Context', function () {
  var context;
  beforeEach(function () {
    context = new Context({ name: 'parent', message: 'hi', a: { b: 'b' } });
  });

  it('is able to lookup properties of its own view', function () {
    assert.equal(context.lookup('name'), 'parent');
  });

  it('is able to lookup nested properties of its own view', function () {
    assert.equal(context.lookup('a.b'), 'b');
  });

  describe('when pushed', function () {
    beforeEach(function () {
      context = context.push({ name: 'child', c: { d: 'd' } });
    });

    it('returns the child context', function () {
      assert.equal(context.view.name, 'child');
      assert.equal(context.parent.view.name, 'parent');
    });

    it('is able to lookup properties of its own view', function () {
      assert.equal(context.lookup('name'), 'child');
    });

    it("is able to lookup properties of the parent context's view", function () {
      assert.equal(context.lookup('message'), 'hi');
    });

    it('is able to lookup nested properties of its own view', function () {
      assert.equal(context.lookup('c.d'), 'd');
    });

    it('is able to lookup nested properties of its parent view', function () {
      assert.equal(context.lookup('a.b'), 'b');
    });
  });
});

describe('A Mustache.Context', function () {
  var context;

  describe('with an empty string in the lookup chain', function () {
    var view, context;
    beforeEach(function () {
      view = { a: '' };
      view.a.b = 'value';
      context = new Context(view);
    });

    it('is able to lookup a nested property', function () {
      assert.equal(context.lookup('a.b'), view.a.b);
    });
  });
});

describe('A Mustache.Context with names inherited from Object.prototype', function () {
  ['toString', 'constructor', 'valueOf', 'hasOwnProperty'].forEach(function (name) {
    it('treats ' + name + ' as missing on a plain object', function () {
      assert.equal(new Context({}).lookup(name), undefined);
    });
  });

  it('renders such names as empty strings', function () {
    assert.equal(Mustache.render('[{{toString}}][{{constructor}}][{{valueOf}}]', {}), '[][][]');
    assert.equal(Mustache.render('{{#user}}[{{toString}}]{{/user}}', { user: { name: 'Ada' } }), '[]');
  });

  it('still finds an own property with that name', function () {
    assert.equal(new Context({ toString: 'own' }).lookup('toString'), 'own');
    assert.equal(Mustache.render('{{toString}}', { toString: 'own' }), 'own');
  });

  it('still finds an override defined further down the prototype chain', function () {
    function Item () {}
    Item.prototype.toString = function () { return 'item'; };
    assert.equal(new Context(new Item()).lookup('toString'), 'item');
  });

  it('falls back to a parent context that has the name as its own property', function () {
    var parent = new Context({ toString: 'parent' });
    var child = new Context({ name: 'child' }, parent);
    assert.equal(child.lookup('toString'), 'parent');
  });
});
