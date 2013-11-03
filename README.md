## Ansidown

Ansidown is a simple module, it aims to solve a niche problem. And that is
somewhat rendering Markdown for terminal usage.

## Installation

```
npm install --save ansidown
```

## Usage

```js
'use strict';

var Parser = require('ansiparse');

var parsed = new Parser('<markdown content here>');

console.log(parsed.toString());
```

### License

MIT
