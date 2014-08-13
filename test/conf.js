var etc = require('../etc'),
    assert = require('assert');

describe('Configuration methods', function () {
  var conf;

  beforeEach(function () {
    conf = etc();
  });

  it('can add basic conf from objects', function () {
    var test = {test: 'object'};
    conf.add(test);
    assert.equal(conf.get('test'), 'object', 'The configuration was not added');
    assert.deepEqual(conf.toJSON(), test);
  });

  it('can get nested conf from objects', function () {
    conf.add({one: {two: {three: 'test'}}});
    assert.equal(conf.get('one:two:three'), 'test');
  });

  it('can set basic conf', function () {
    conf.add({name: 'Brian'});
    conf.set('name', 'Carlos');
    assert.equal(conf.get('name'), 'Carlos');
  });

  it('can set nested conf', function () {
    conf.add({player: {name: 'Brian'}});
    conf.set('player:name', 'Carlos');
    assert.equal(conf.get('player:name'), 'Carlos');
  });

  it('can reset conf', function() {
    conf.add({name: 'Brian'});
    conf.reset('name', 'Andrew');
    assert.equal(conf.get('name'), 'Andrew');
  });

  it('can reset nested conf', function() {
    conf.add({person: {name: 'Brian'}});
    conf.reset('person:name', 'Andrew');
    assert.equal(conf.get('person:name'), 'Andrew');
  });

  it('can clear conf', function () {
    conf.add({name: 'Brian', lang: 'English'});
    conf.clear('name');
    assert.deepEqual(conf.get(), {lang: 'English'});
  });

  it('can clear nested conf', function () {
    conf.add({person: {name: 'Brian', lang: 'English'}});
    conf.clear('person:name');
    assert.deepEqual(conf.get(), {person: {lang: 'English'}});
  });

  it('can add conf from package.json', function () {
    conf.pkg();
    assert.deepEqual(conf.get('meat'), {white: {chicken: "free-range"}});
  });

  it('can read conf from ./etc', function () {
    conf.etc();
    assert.deepEqual(conf.get('candy'), {chewy: 'gum'});
    assert.deepEqual(conf.get('fruit'), {green: {apple: 'granny'}});
    assert.deepEqual(conf.get('meat'), {red: {steak: "ribeye"}});
    assert.deepEqual(conf.get('drinks'), {cold: {soda: 'coke'}, hot: {coffee: 'french roast'}});
  });

  it('can read conf from environment', function () {
    process.env['test_lang'] = 'en';
    process.env['test_user_name'] = 'Brian';
    process.env['test_user_handle'] = 'cpsubrian';
    conf.env('test_');
    assert.deepEqual(conf.get('lang'), 'en');
    assert.deepEqual(conf.get('user'), {name: 'Brian', handle: 'cpsubrian'});
    delete process.env['test_lang'];
    delete process.env['test_user:name'];
    delete process.env['test_user:handle'];
  });

  it('can read conf from environment using custom delimiter', function () {
    process.env['test_lang'] = 'fr';
    process.env['test_user__name'] = 'Joe';
    process.env['test_user__handle'] = 'joemc';
    conf.env('test_', '__');
    assert.deepEqual(conf.get('lang'), 'fr');
    assert.deepEqual(conf.get('user'), {name: 'Joe', handle: 'joemc'});
    delete process.env['test_lang'];
    delete process.env['test_user__name'];
    delete process.env['test_user__handle'];
  });

  it('can read conf from environment using parser', function () {
    process.env['test_flag'] = 'true';
    process.env['test_literal'] = 'Joe';
    process.env['test_number'] = '0.4';
    process.env['test_array'] = '[1, 1, 2, 3, 5, 8]';
    conf.env('test_');
    assert.deepEqual(conf.get('flag'), true);
    assert.deepEqual(conf.get('literal'), 'Joe');
    assert.deepEqual(conf.get('number'), 0.4);
    assert.deepEqual(conf.get('array'), [1, 1, 2, 3, 5, 8]);
    delete process.env['test_flag'];
    delete process.env['test_literal'];
    delete process.env['test_number'];
    delete process.env['test_array'];
  });

  it('can add conf using the `all` alias', function () {
    conf.all();
    assert.deepEqual(conf.get('fruit'), {green: {apple: 'granny'}, red: {apple: 'fuji'}});
  });

  it('made-up key returns undefined', function () {
    conf.set('foo', 'bar');
    assert.strictEqual(conf.get('blah'), undefined);
  });

  it('multi-part made-up key returns undefined', function () {
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
