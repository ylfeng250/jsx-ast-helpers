import * as t from '@babel/types';
import {
  getJSXElementName,
  getJSXMemberExpressionName,
  visitJSXElementAttributes,
  removeJSXElementAttributeByName,
  getJSXElementAttributes,
  getJSXElementChildrenNames,
  hasJSXElementId,
  appendChildToJSXElement,
  updateJSXElementAttribute,
  cloneJSXElement
} from './jsx-helpers';

describe('JSX Helpers', () => {
  describe('getJSXElementName', () => {
    it('should return name for JSXIdentifier', () => {
      const element = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('div'), []),
        t.jsxClosingElement(t.jsxIdentifier('div')),
        []
      );
      expect(getJSXElementName(element)).toBe('div');
    });

    it('should return name for JSXMemberExpression', () => {
      const element = t.jsxElement(
        t.jsxOpeningElement(
          t.jsxMemberExpression(
            t.jsxIdentifier('Components'),
            t.jsxIdentifier('Button')
          ),
          []
        ),
        t.jsxClosingElement(
          t.jsxMemberExpression(
            t.jsxIdentifier('Components'),
            t.jsxIdentifier('Button')
          )
        ),
        []
      );
      expect(getJSXElementName(element)).toBe('Components.Button');
    });

    it('should return name for JSXNamespacedName', () => {
      const element = t.jsxElement(
        t.jsxOpeningElement(
          t.jsxNamespacedName(
            t.jsxIdentifier('svg'),
            t.jsxIdentifier('path')
          ),
          []
        ),
        t.jsxClosingElement(
          t.jsxNamespacedName(
            t.jsxIdentifier('svg'),
            t.jsxIdentifier('path')
          )
        ),
        []
      );
      expect(getJSXElementName(element)).toBe('svg:path');
    });
  });

  describe('getJSXMemberExpressionName', () => {
    it('should return correct name for nested member expression', () => {
      const expr = t.jsxMemberExpression(
        t.jsxMemberExpression(
          t.jsxIdentifier('Components'),
          t.jsxIdentifier('Form')
        ),
        t.jsxIdentifier('Input')
      );
      expect(getJSXMemberExpressionName(expr)).toBe('Components.Form.Input');
    });
  });

  describe('visitJSXElementAttributes', () => {
    it('should visit all JSXAttributes', () => {
      const element = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('div'), [
          t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral('test')),
          t.jsxAttribute(t.jsxIdentifier('class'), t.stringLiteral('main'))
        ]),
        t.jsxClosingElement(t.jsxIdentifier('div')),
        []
      );
      const visited: string[] = [];
      visitJSXElementAttributes(element, (attr) => {
        visited.push((attr.name.name as string));
      });
      expect(visited).toEqual(['id', 'class']);
    });
  });

  describe('removeJSXElementAttributeByName', () => {
    it('should remove specified attribute', () => {
      const element = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('div'), [
          t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral('test')),
          t.jsxAttribute(t.jsxIdentifier('class'), t.stringLiteral('main'))
        ]),
        t.jsxClosingElement(t.jsxIdentifier('div')),
        []
      );
      const result = removeJSXElementAttributeByName(element, 'id');
      expect(result.openingElement.attributes).toHaveLength(1);
      expect(getJSXElementAttributes(result)[0].name.name).toBe('class');
    });
  });

  describe('getJSXElementChildrenNames', () => {
    it('should return names of child elements', () => {
      const element = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('div'), []),
        t.jsxClosingElement(t.jsxIdentifier('div')),
        [
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier('span'), []),
            t.jsxClosingElement(t.jsxIdentifier('span')),
            []
          ),
          t.jsxText('text'),
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier('p'), []),
            t.jsxClosingElement(t.jsxIdentifier('p')),
            []
          )
        ]
      );
      expect(getJSXElementChildrenNames(element)).toEqual(['span', 'p']);
    });
  });

  describe('hasJSXElementId', () => {
    it('should return true when element has matching id', () => {
      const element = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('div'), [
          t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral('test'))
        ]),
        t.jsxClosingElement(t.jsxIdentifier('div')),
        []
      );
      expect(hasJSXElementId(element, 'test')).toBe(true);
    });

    it('should return false when element has different id', () => {
      const element = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('div'), [
          t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral('other'))
        ]),
        t.jsxClosingElement(t.jsxIdentifier('div')),
        []
      );
      expect(hasJSXElementId(element, 'test')).toBe(false);
    });
  });

  describe('appendChildToJSXElement', () => {
    it('should append child element', () => {
      const parent = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('div'), []),
        t.jsxClosingElement(t.jsxIdentifier('div')),
        []
      );
      const child = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('span'), []),
        t.jsxClosingElement(t.jsxIdentifier('span')),
        []
      );
      const result = appendChildToJSXElement(parent, child);
      expect(result.children).toHaveLength(1);
      expect(getJSXElementName(result.children[0] as t.JSXElement)).toBe('span');
    });
  });

  describe('updateJSXElementAttribute', () => {
    it('should update existing attribute', () => {
      const element = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('div'), [
          t.jsxAttribute(t.jsxIdentifier('class'), t.stringLiteral('old'))
        ]),
        t.jsxClosingElement(t.jsxIdentifier('div')),
        []
      );
      const result = updateJSXElementAttribute(
        element,
        'class',
        t.stringLiteral('new')
      );
      const attr = getJSXElementAttributes(result)[0];
      expect(attr.value!.type).toBe('StringLiteral');
      expect((attr.value as t.StringLiteral).value).toBe('new');
    });
  });

  describe('cloneJSXElement', () => {
    it('should create deep clone of element', () => {
      const original = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('div'), [
          t.jsxAttribute(t.jsxIdentifier('class'), t.stringLiteral('main'))
        ]),
        t.jsxClosingElement(t.jsxIdentifier('div')),
        [
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier('span'), []),
            t.jsxClosingElement(t.jsxIdentifier('span')),
            []
          )
        ]
      );
      const clone = cloneJSXElement(original);
      expect(clone).not.toBe(original);
      expect(getJSXElementName(clone)).toBe('div');
      expect(getJSXElementAttributes(clone)).toHaveLength(1);
      expect(clone.children).toHaveLength(1);
      expect(getJSXElementName(clone.children[0] as t.JSXElement)).toBe('span');
    });
  });
});