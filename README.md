# jsx-ast-helpers

A set of helper functions for processing JSX AST nodes using Babel and TypeScript.

## Features

- Access and manipulate JSX element attributes
- Insert, replace, and delete JSX elements
- Query and update tracking data
- Deep copy JSX elements
- And more...

## Installation

```bash
npm install jsx-ast-helpers
```

## Usage

```typescript
import { getJSXElementName } from 'jsx-ast-helpers';

// Example: Process JSX AST in a Babel plugin
const elementName = getJSXElementName(jsxElement);
```

## Build

```bash
npm run build
```

## License

MIT