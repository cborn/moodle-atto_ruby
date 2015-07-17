YUI.add('moodle-atto_ruby-button', function (Y, NAME) {

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    atto_ruby
 * @copyright  2015 Jetha Chan <jetha@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_ruby_alignment-button
 */

/**
 * Atto text ruby annotation tool.
 *
 * @namespace M.atto_ruby
 * @class Button
 * @extends M.editor_atto.EditorPlugin
 */

var CSS = {
        RUBYPREVIEW: 'atto_ruby_preview',

        INPUTRUBY: 'atto_ruby_phonetics',
        INPUTTEXT: 'atto_ruby_text',
        INPUTREMOVE: 'atto_ruby_remove',
        INPUTSUBMIT: 'atto_ruby_submit',
    },
    SELECTORS = {
        INPUTURL: '.' + CSS.INPUTRUBY
    },

    COMPONENTNAME = 'atto_ruby',

    RUBYTEMPLATE = '' +
            '<ruby>' +
                '<rb>{{text}}</rb>' +
                '<rp>{{placeholders.left}}</rp>' +
                '<rt>{{phonetic}}</rt>' +
                '<rp>{{placeholders.right}}</rp>' +
            '</ruby>',

    TEMPLATE = '' +
            '<form class="atto_form">' +
                '<label for="{{elementid}}_{{CSS.INPUTTEXT}}">{{get_string "text" component}}</label>' +
                '<input class="fullwidth {{CSS.INPUTTEXT}}" type="text" id="{{elementid}}_{{CSS.INPUTTEXT}}" size="32"/>' +
                '<label for="{{elementid}}_{{CSS.INPUTRUBY}}">{{get_string "phonetics" component}}</label>' +
                '<input class="fullwidth {{CSS.INPUTRUBY}}" type="text" id="{{elementid}}_{{CSS.INPUTRUBY}}" size="32"/>' +
                '<br/>' +
                // Add the image preview.
                '<div class="mdl-align">' +
                '<div class="{{CSS.RUBYPREVIEW}}">{{{renderedpreview}}}</div>' +

                // Add the submit button and close the form.
                '<button class="{{CSS.INPUTSUBMIT}}" type="submit">{{get_string "save" component}}</button>' +
                '<button class="{{CSS.INPUTREMOVE}}" type="submit">{{get_string "remove" component}}</button>' +
                '</div>' +
            '</form>';

Y.namespace('M.atto_ruby').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    /**
     * A reference to the current selection at the time that the dialogue
     * was opened.
     *
     * @property _currentSelection
     * @type Range
     * @private
     */
    _currentSelection: null,

    /**
     * The most recently selected image.
     *
     * @param _selectedRuby
     * @type Node
     * @private
     */
    _selectedRuby: null,
    _wasPlainText: false,

    _currentProperties: {
        text: '',
        phonetic: '',
        placeholders: {
            left: M.util.get_string('placeholderleft', COMPONENTNAME),
            right: M.util.get_string('placeholderright', COMPONENTNAME)
        }
    },

    /**
     * A reference to the currently open form.
     *
     * @param _form
     * @type Node
     * @private
     */
    _form: null,

    /**
     * The dimensions of the raw image before we manipulate it.
     *
     * @param _rawImageDimensions
     * @type Object
     * @private
     */
    _rawImageDimensions: null,

    initializer: function() {

        this.addButton({
            icon: 'icon',
            iconComponent: COMPONENTNAME,
            callback: this._displayDialogue,
            tags: 'ruby',
            tagMatchRequiresAll: false
        });
        this.editor.delegate('dblclick', this._displayDialogue, 'ruby', this);
        this.editor.delegate('click', this._handleClick, 'ruby', this);
    },

    /**
     * Handle a click on an image.
     *
     * @method _handleClick
     * @param {EventFacade} e
     * @private
     */
    _handleClick: function(e) {
        /*
        var image = e.target;

        var selection = this.get('host').getSelectionFromNode(image);
        if (this.get('host').getSelection() !== selection) {
            this.get('host').setSelection(selection);
        }
        */
    },

    /**
     * Display the image editing tool.
     *
     * @method _displayDialogue
     * @private
     */
    _displayDialogue: function() {
        // Store the current selection.
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            return;
        }

        // Reset the image dimensions.
        this._rawImageDimensions = null;

        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('addruby', COMPONENTNAME),
            width: '480px',
            focusAfterHide: true,
            focusOnShowSelector: SELECTORS.INPUTURL
        });

        // Set the dialogue content, and then show the dialogue.
        dialogue.set('bodyContent', this._getDialogueContent())
                .show();
    },

    /**
     * Return the dialogue content for the tool, attaching any required
     * events.
     *
     * @method _getDialogueContent
     * @return {Node} The content to place in the dialogue.
     * @private
     */
    _getDialogueContent: function() {
        var template = Y.Handlebars.compile(TEMPLATE),
            content = Y.Node.create(template({
                elementid: this.get('host').get('elementid'),
                CSS: CSS,
                component: COMPONENTNAME
            }));

        console.log('elementid: ' + this.get('host').get('elementid'));

        this._form = content;

        // Configure the view of the current image.
        this._applyRubyProperties(this._form);

        this._form.one('.' + CSS.INPUTRUBY).on('change', this._rubyChanged, this);
        this._form.one('.' + CSS.INPUTTEXT).on('change', this._rubyChanged, this);
        this._form.one('.' + CSS.INPUTRUBY).on('keyup', this._rubyChanged, this);
        this._form.one('.' + CSS.INPUTTEXT).on('keyup', this._rubyChanged, this);
        this._form.one('.' + CSS.INPUTSUBMIT).on('click', this._setRuby, this);
        this._form.one('.' + CSS.INPUTREMOVE).on('click', this._clearRuby, this);


        return content;
    },

    _updatePreview: function(properties) {
        var template = Y.Handlebars.compile(RUBYTEMPLATE),
            content = Y.Node.create(template(properties)),
            preview = this._form.one('.' + CSS.RUBYPREVIEW);
        window.foobar = content;

        preview.set('innerHTML', '');
        content.appendTo(preview);
    },

    /**
     * Applies properties of an existing ruby tag to the ruby dialogue for editing.
     *
     * @method _applyRubyProperties
     * @param {Node} form
     * @private
     */
    _applyRubyProperties: function(form) {
        var properties = this._getSelectedRubyProperties();

        if (properties.phonetic) {
            form.one('.' + CSS.INPUTRUBY).set('value', properties.phonetic);
        }
        if (properties.text) {
            form.one('.' + CSS.INPUTTEXT).set('value', properties.text);
        }

        this._currentProperties = properties;

        // Update the preview based on the form properties.
        this._updatePreview(properties);
    },

    /**
     * Gets the properties of the currently selected ruby text.
     *
     * The first ruby tag only if multiple tags are selected.
     *
     * @method _getSelectedRubyProperties
     * @return {object}
     * @private
     */
    _getSelectedRubyProperties: function() {
        var properties = {
                text: '',
                phonetic: '',
                placeholders: {
                    left: M.util.get_string('placeholderleft', COMPONENTNAME),
                    right: M.util.get_string('placeholderright', COMPONENTNAME)
                }
            },
            host = this.get('host'),
            tags = this.get('host').getSelectedNodes();

        if (tags && tags.size()) {
            console.log(tags);

            tag = tags.item(0);

/*
            switch (tag.get('nodeName')) {
                case 'ruby':
                    break;
                case '#text':
                    break;
            }
*/
            // #text handling
            if (tag.get('nodeName') !== 'ruby') {
                var ancestor = tag.ancestor('ruby');
                if (ancestor === null) {
                    // this is just plain text
                    properties.text = this._currentSelection.toString();
                    return properties;
                } else {
                    tag = ancestor;
                    this._selectedRuby = tag;
                }
            }

            if (tag.one('rb') != null) {
                properties.text = tag.one('rb').get('text');
            }
            if (tag.one('rt') != null) {
                properties.phonetic = tag.one('rt').get('text');
            }
            if (tag.all('rp').item(0) != null) {
                properties.placeholders.left = tag.all('rp').item(0).get('text');
            }
            if (tag.all('rp').item(1) != null) {
                properties.placeholders.right = tag.all('rp').item(1).get('text');
            }

            return properties;
        }
        return false;
    },

    /**
     * Update the form when the URL was changed. This is pretty much just
     * re-rendering the ruby.
     *
     * @method _rubyChanged
     * @private
     */
    _rubyChanged: function() {
        var inputruby = this._form.one('.' + CSS.INPUTRUBY),
            inputtext = this._form.one('.' + CSS.INPUTTEXT),
            preview = this._form.one('.' + CSS.RUBYPREVIEW);

        // does the ruby preview already exist? sure hope so
        this._currentProperties.phonetic = inputruby.get('value');
        this._currentProperties.text = inputtext.get('value');

        if (preview.one('ruby') == null) {
            // if it doesn't, render the template again.
            this._updatePreview(this._currentProperties);
        } else {
            // but if it does, just target the appropriate elements.
            preview.one('rb').set('text', this._currentProperties.text);
            preview.one('rt').set('text', this._currentProperties.phonetic);
        }
    },

    /**
     * Update the ruby in the contenteditable.
     *
     * @method _setRuby
     * @param {EventFacade} e
     * @private
     */
    _setRuby: function(e) {
        var form = this._form,
            inputruby = this._form.one('.' + CSS.INPUTRUBY),
            inputtext = this._form.one('.' + CSS.INPUTTEXT),
            preview = this._form.one('.' + CSS.RUBYPREVIEW),
            template = Y.Handlebars.compile(RUBYTEMPLATE),
            content = template(this._currentProperties),
            host = this.get('host');

        if (inputruby.get('value').trim().length === 0) {

            // If the user has blanekd the ruby field, infer that they
            // want it to stop being a <ruby /> tag.
            this._clearRuby(e);

        } else {

            // Else, update the <ruby /> tag.
            e.preventDefault();

            host.focus();
            if (this._selectedRuby) {
                host.setSelection(host.getSelectionFromNode(this._selectedRuby));
            } else {
                host.setSelection(this._currentSelection);
            }
            this._currentSelection = null;
            this._selectedRuby = null;

            this.get('host').insertContentAtFocusPoint(content);

            this.markUpdated();

            this.getDialogue({
                focusAfterHide: null
            }).hide();
        }
    },

    /**
     * Revert the ruby in the contenteditable back to plain text.
     *
     * @method _clearRuby
     * @param {EventFacade} e
     * @private
     */
    _clearRuby: function(e) {
        var inputtext = this._form.one('.' + CSS.INPUTTEXT),
            host = this.get('host');

        e.preventDefault();
        host.focus();
        if (this._selectedRuby) {
            host.setSelection(host.getSelectionFromNode(this._selectedRuby));
        } else {
            host.setSelection(this._currentSelection);
        }

        this.get('host').insertContentAtFocusPoint(inputtext.get('value').trim());

        this.markUpdated();

        this.getDialogue({
            focusAfterHide: null
        }).hide();

    }
});


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]});
