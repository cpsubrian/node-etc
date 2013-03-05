var etc = require('../etc'),
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
    assert.deepEqual(conf.get('drinks'), {cold: {soda: 'coke'}, hot: {coffee: 'french roast'}});
  });

  it('can read conf from environment', function () {
    process.env['test_lang'] = 'en';
    process.env['test_user:name'] = 'Brian';
    process.env['test_user:handle'] = 'cpsubrian';
    conf.env('test');
    assert.deepEqual(conf.get('lang'), 'en');
    assert.deepEqual(conf.get('user'), {name: 'Brian', handle: 'cpsubrian'});
    delete process.env['test_lang'];
    delete process.env['test_user:name'];
    delete process.env['test_user:handle'];
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

  it('can reverse', function () {
    conf.add({movie: 'The Matrix'});
    assert.strictEqual(conf.get('movie'), 'The Matrix');
    conf.add({movie: 'Ironman'});
    assert.strictEqual(conf.get('movie'), 'The Matrix');
    conf.reverse().add({movie: 'Ghostbusters'});
    assert.strictEqual(conf.get('movie'), 'Ghostbusters');
    conf.reverse().add({movie: 'StarWars'});
    assert.strictEqual(conf.get('movie'), 'Ghostbusters');
  });
});
