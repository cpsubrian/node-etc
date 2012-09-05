var etc = require('../'),
    assert = require('assert');

describe('Configuration methods', function() {
  var conf;

  beforeEach(function() {
    conf = etc();
  });

  it('can add basic conf from objects', function() {
    var test = {test: 'object'};
    conf.add(test);
    assert.equal(conf.get('test'), 'object', 'The configuration was not added');
    assert.deepEqual(conf.toJSON(), test);
  });

  it('can get nested conf from objects', function() {
    conf.add({one: {two: {three: 'test'}}});
    assert.equal(conf.get('one:two:three'), 'test');
  });

  it('can set basic conf', function() {
    conf.add({name: 'Brian'});
    conf.set('name', 'Carlos');
    assert.equal(conf.get('name'), 'Carlos');
  });

  it('can set nested conf', function() {
    conf.add({player: {name: 'Brian'}});
    conf.set('player:name', 'Carlos');
    assert.equal(conf.get('player:name'), 'Carlos');
  });

  it('can add conf from package.json', function() {
    conf.pkg();
    assert.deepEqual(conf.get('meat'), {white: {chicken: "free-range"}});
  });

  it('can read conf from ./etc', function() {
    conf.etc();
    assert.deepEqual(conf.get('candy'), {chewy: 'gum'});
    assert.deepEqual(conf.get('fruit'), {green: {apple: 'granny'}});
    assert.deepEqual(conf.get('meat'), {red: {steak: "ribeye"}});
  });

  it('can add conf using the `all` alias', function() {
    conf.all();
    assert.deepEqual(conf.get('fruit'), {green: {apple: 'granny'}, red: {apple: 'fuji'}});
  });

  it('made-up key returns undefined', function() {
    conf.set('foo', 'bar');
    assert.strictEqual(conf.get('blah'), undefined);
  });

  it('multi-part made-up key returns undefined', function() {
    conf.set('foo', {bar: true});
    assert.strictEqual(conf.get('baz:lol'), undefined);
  });
});
