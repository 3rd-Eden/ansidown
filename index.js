'use strict';

var colors = require('colors');

/**
 *
 * @constructor
 * @param {String} content The markdown.
 * @api public
 */
function Parser(content) {
  if (!(this instanceof Parser)) return new Parser(content);

  this.content = content;
  this.ansi = '';
}

Parser.prototype.__proto__ = require('events').EventEmitter.prototype;

Parser.rules = [
  [ // Markdown headers.
    /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
    function tokenizer(tokens) {
      return {
        type: 'header',
        text: tokens[2],
        size: tokens[1].length,
        render: Parser.rules[0][2]
      };
    },
    function render() {
      return this.text.bold.underline +'\n\n';
    }
  ],
  [ // Links.
    /\[([^\[]+)\]\(([^\)]+)\)/,
    function tokenizer(tokens) {
      return {
        type: 'link',
        text: 'not supported',
        render: Parser.rules[1][2]
      };
    },
    function render() {

    }
  ],
  [ // Bold tags.
    /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
    function tokenizer(tokens) {
      return {
        type: 'bold',
        text: tokens[2] || tokens[1],
        render: Parser.rules[2][2]
      };
    },
    function render() {
      return this.text.bold;
    }
  ],
  [ // Emphasis.
    /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
    function tokenizer(tokens) {
      return {
        type: 'italic',
        text: tokens[2] || tokens[1],
        render: Parser.rules[3][2]
      };
    },
    function render() {
      return this.text.italic;
    }
  ],
  [ // Code.
    /^( {4}[^\n]+\n*)+/,
    function tokenizer(tokens) {
      return {
        type: 'code',
        language: 'generic',
        text: tokens[2] || tokens[1],
        render: Parser.rules[4][2]
      };
    },
    function render() {
      return '  '+ this.text;
    }
  ],
  [ // Inline code block.
    /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    function tokenizer(tokens) {
      return {
        type: 'code',
        language: 'generic',
        text: tokens[2] || tokens[1],
        render: Parser.rules[5][2]
      };
    },
    function render() {
      return this.text.inverse;
    }
  ],
  [
    // Github Flavoured Markdown (GFM) code block.
    /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
    function tokenizer(tokens) {
      return {
        type: 'code',
        language: tokens[2],
        text: tokens[3],
        render: Parser.rules[6][2]
      };
    },
    function render() {
      return this.text;
    }
  ],
  [
    // Horizontal ruler.
    /^( *[-*_]){3,} *(?:\n+|$)/,
    function tokenizer(tokens) {
      return {
        type: 'ruler',
        render: Parser.rules[7][2]
      };
    },
    function render() {
      return '-----------------------';
    }
  ]
];

/**
 * Parse the content, chunk by chunk.
 *
 * @param {String} content The Markdown that needs to be parsed
 * @api private
 */
Parser.prototype.parse = function parse(content) {
  content = (content || this.content).toString().trim();

  var tokens = []
    , token
    , rule;

  tokenizer:
  while (content) {
    rules:
    for (var i = 0, length = Parser.rules.length; i < length; i++) {
      rule = Parser.rules[i];

      if (token = rule[0].exec(content)) {
        content = content.substring(token[0].length);
        tokens.push(rule[1](token));

        continue tokenizer;
      }
    }

    tokens.push({
      type: 'char',
      text: content.charAt(0),
      render: function render() {
        return this.text;
      }
    });

    content = content.substring(1);
  }

  this.render(tokens);
};

/**
 * Render the ansi output from the given set of tokens.
 *
 * @api private
 */
Parser.prototype.render = function render(tokens) {
  var parser = this
    , ansi = '';

  tokens.forEach(function transform(token) {
    var data = { data: token.text };

    if (parser.listeners(token.type).length) {
      parser.emit(token.type, data);
      data = data.data;
    } else {
      data = token.render();
    }

    ansi += data;
  });

  this.ansi = ansi;
};

/**
 * Return the ANSI generated output.
 *
 * @returns {String}
 * @api public
 */
Parser.prototype.toString = function toString() {
  if (!this.ansi) this.parse();

  return this.ansi;
};

//
// Expose the module.
//
module.exports = Parser;
