# moodle-atto_ruby
[Ruby][1] support for Atto! This plugin contains an Atto toolbar button that simplifies annotating text with phonetic information - select some text, click the button and add the pronunciation of the text in question.

Requires [MDL-50868][3] integrated into your Moodle install; the exact versions are listed in the requirements section below. At present, Moodle 2.7 and prior are no longer getting non-critical bug requests so if you want to use this plugin, request a backport or do it yourself :)

## Requirements
* Moodle 2.8: 2.8.7+ (Build: 20150730)
* Moodle 2.9: 2.9.1+ (Build: 20150730)
* Moodle 3.0+: any version

## Quick install
1. Put this entire directory at PATHTOMOODLE/lib/editor/atto/plugins/ruby
2. Visit your site notifications page to install the new plugin.
3. Add the "ruby" plugin to the Atto toolbar.

## Information
* Source control url: [moodle-atto_ruby][4]
* Bug tracker: [GitHub Issues for moodle-atto_ruby][5]

[1]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby  "<ruby>"
[2]: http://www.moodle.org/     "Moodle"
[3]: https://tracker.moodle.org/browse/MDL-50868 "MDL-50868"
[4]: https://github.com/jethac/moodle-atto_ruby "moodle-atto_ruby"
[5]: https://github.com/jethac/moodle-atto_ruby/issues "GitHub Issues for moodle-atto_ruby"