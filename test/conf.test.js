var etc = require('../etc');

describe('Configuration methods', function () {
  var conf;

  beforeEach(function () {
    conf = etc();
    jest.replaceProperty(process, 'env', {...process.env});
  });

  afterEach(function () {
    jest.restoreAllMocks();
  });

  it('can add basic conf from objects', function () {
    var test = {test: 'object'};
    conf.add(test);
    expect(conf.get('test')).toBe('object');
    expect(conf.toJSON()).toStrictEqual(test);
  });

  it('can get nested conf from objects', function () {
    conf.add({one: {two: {three: 'test'}}});
    expect(conf.get('one:two:three')).toBe('test');
  });

  it('can set basic conf', function () {
    conf.add({name: 'Brian'});
    conf.set('name', 'Carlos');
    expect(conf.get('name')).toBe('Carlos');
  });

  it('can set nested conf', function () {
    conf.add({player: {name: 'Brian'}});
    conf.set('player:name', 'Carlos');
    expect(conf.get('player:name')).toBe('Carlos');
  });

  it('can reset conf', function() {
    conf.add({name: 'Brian'});
    conf.reset('name', 'Andrew');
    expect(conf.get('name')).toBe('Andrew');
  });

  it('can reset nested conf', function() {
    conf.add({person: {name: 'Brian'}});
    conf.reset('person:name', 'Andrew');
    expect(conf.get('person:name')).toBe('Andrew');
  });

  it('can clear conf', function () {
    conf.add({name: 'Brian', lang: 'English'});
    conf.clear('name');
    expect(conf.get()).toStrictEqual({lang: 'English'});
  });

  it('can clear nested conf', function () {
    conf.add({person: {name: 'Brian', lang: 'English'}});
    conf.clear('person:name');
    expect(conf.get()).toStrictEqual({person: {lang: 'English'}});
  });

  it('can add conf from package.json', function () {
    conf.pkg();
    expect(conf.get('meat')).toStrictEqual({white: {chicken: "free-range"}});
  });

  it('can add conf from an explicit module', function () {
    conf.pkg(module);
    expect(conf.get('meat')).toStrictEqual({white: {chicken: 'free-range'}});
  });

  it('can add conf from an explicit package.json path', function () {
    conf.pkg(require('path').join(__dirname, 'package.json'));
    expect(conf.get('meat')).toStrictEqual({white: {chicken: 'free-range'}});
  });

  it('can read conf from ./etc', function () {
    conf.etc();
    expect(conf.get('candy')).toStrictEqual({chewy: 'gum'});
    expect(conf.get('fruit')).toStrictEqual({green: {apple: 'granny'}});
    expect(conf.get('meat')).toStrictEqual({red: {steak: "ribeye"}});
    expect(conf.get('drinks')).toStrictEqual({cold: {soda: 'coke'}, hot: {coffee: 'french roast'}});
  });

  it('can read conf from environment', function () {
    process.env['test_lang'] = 'en';
    process.env['test_user_name'] = 'Brian';
    process.env['test_user_handle'] = 'cpsubrian';
    conf.env('test_');
    expect(conf.get('lang')).toBe('en');
    expect(conf.get('user')).toStrictEqual({name: 'Brian', handle: 'cpsubrian'});
  });

  it('can read conf from environment using custom delimiter', function () {
    process.env['test_lang'] = 'fr';
    process.env['test_user__name'] = 'Joe';
    process.env['test_user__handle'] = 'joemc';
    conf.env('test_', '__');
    expect(conf.get('lang')).toBe('fr');
    expect(conf.get('user')).toStrictEqual({name: 'Joe', handle: 'joemc'});
  });

  it('can read conf from environment using parser', function () {
    process.env['test_flag'] = 'true';
    process.env['test_literal'] = 'Joe';
    process.env['test_number'] = '0.4';
    process.env['test_array'] = '[1, 1, 2, 3, 5, 8]';
    conf.env('test_');
    expect(conf.get('flag')).toBe(true);
    expect(conf.get('literal')).toBe('Joe');
    expect(conf.get('number')).toBe(0.4);
    expect(conf.get('array')).toStrictEqual([1, 1, 2, 3, 5, 8]);
  });

  it('can add conf using the `all` alias', function () {
    conf.all();
    expect(conf.get('fruit')).toStrictEqual({green: {apple: 'granny'}, red: {apple: 'fuji'}});
  });

  it('made-up key returns undefined', function () {
    conf.set('foo', 'bar');
    expect(conf.get('blah')).toBeUndefined();
  });

  it('multi-part made-up key returns undefined', function () {
    conf.set('foo', {bar: true});
    expect(conf.get('baz:lol')).toBeUndefined();
  });

  it('can reverse', function () {
    conf.add({movie: 'The Matrix'});
    expect(conf.get('movie')).toBe('The Matrix');
    conf.add({movie: 'Ironman'});
    expect(conf.get('movie')).toBe('The Matrix');
    conf.reverse().add({movie: 'Ghostbusters'});
    expect(conf.get('movie')).toBe('Ghostbusters');
    conf.reverse().add({movie: 'StarWars'});
    expect(conf.get('movie')).toBe('Ghostbusters');
  });
});
