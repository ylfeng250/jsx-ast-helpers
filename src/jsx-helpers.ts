import * as t from '@babel/types';

/**
 * 获取 JSX 元素的名称（支持 JSXIdentifier、JSXMemberExpression 和 JSXNamespacedName）
 * @param element JSX 元素
 * @returns JSX 元素的名称
 * @example getJSXElementName(t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('div'), []), t.jsxClosingElement(t.jsxIdentifier('div')), [])); // 'div'
 */
export function getJSXElementName(element: t.JSXElement): string {
  const nameNode = element.openingElement.name;
  if (t.isJSXIdentifier(nameNode)) {
    return nameNode.name;
  } else if (t.isJSXMemberExpression(nameNode)) {
    return getJSXMemberExpressionName(nameNode);
  } else if (t.isJSXNamespacedName(nameNode)) {
    return `${nameNode.namespace.name}:${nameNode.name.name}`;
  }
  return '';
}

/**
 *  获取 JSXMemberExpression 的名称
 * @param member JSXMemberExpression
 * @returns JSXMemberExpression 的名称
 * @example getJSXMemberExpressionName(t.jsxMemberExpression(t.jsxIdentifier('Components'), t.jsxIdentifier('Button'))); // 'Components.Button'
 */

export function getJSXMemberExpressionName(member: t.JSXMemberExpression): string {
  const object = member.object;
  const property = member.property;
  let objectName = '';
  if (t.isJSXIdentifier(object)) {
    objectName = object.name;
  } else if (t.isJSXMemberExpression(object)) {
    objectName = getJSXMemberExpressionName(object);
  }
  return `${objectName}.${property.name}`;
}

/**
 * 遍历 JSX 元素的所有属性，并对每个 JSXAttribute 调用 visitor
 * @param element JSX 元素
 * @param visitor 访问器函数
 */
export function visitJSXElementAttributes(
  element: t.JSXElement,
  visitor: (attr: t.JSXAttribute) => void
): void {
  element.openingElement.attributes.forEach(attr => {
    if (t.isJSXAttribute(attr)) {
      visitor(attr);
    }
  });
}

/**
 * 根据属性名删除 JSX 元素中的属性
 * @param element JSX 元素
 * @param name 属性名
 * @returns 删除属性后的 JSX 元素
 */
export function removeJSXElementAttributeByName(
  element: t.JSXElement,
  name: string
): t.JSXElement {
  element.openingElement.attributes = element.openingElement.attributes.filter(attr => {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
      return attr.name.name !== name;
    }
    return true;
  });
  return element;
}

/**
 * 获取 JSX 元素中所有的 JSXAttribute
 * @param element JSX 元素
 * @returns JSX 元素中所有的 JSXAttribute
 */
export function getJSXElementAttributes(element: t.JSXElement): t.JSXAttribute[] {
  return element.openingElement.attributes.filter((attr): attr is t.JSXAttribute => {
    return t.isJSXAttribute(attr);
  });
}

/**
 * 获取 JSX 元素直接子节点中（如果为 JSXElement）的名称列表
 * @param element JSX 元素
 * @returns JSX 元素直接子节点中（如果为 JSXElement）的名称列表
 */
export function getJSXElementChildrenNames(element: t.JSXElement): string[] {
  const names: string[] = [];
  element.children.forEach(child => {
    if (t.isJSXElement(child)) {
      names.push(getJSXElementName(child));
    }
  });
  return names;
}

/**
 * 递归遍历 AST 节点，当遇到名称匹配的 JSXElement 时调用 visitor
 * 如果传入的 name 是空字符串，则对所有 JSXElement 都调用 visitor
 * @param node AST 节点
 */
export function visitJSXElementByName(
  node: t.Node,
  name: string,
  visitor: (element: t.JSXElement) => void
): void {
  if (t.isJSXElement(node)) {
    if (!name || getJSXElementName(node) === name) {
      visitor(node);
    }
    node.children.forEach(child => visitJSXElementByName(child, name, visitor));
  } else {
    // 遍历其它对象属性
    for (const key in node) {
      const val = (node as any)[key];
      if (Array.isArray(val)) {
        val.forEach((child: any) => {
          if (child && typeof child.type === 'string') {
            visitJSXElementByName(child, name, visitor);
          }
        });
      } else if (val && typeof val.type === 'string') {
        visitJSXElementByName(val, name, visitor);
      }
    }
  }
}


/**
 * 判断一个 JSX 元素是否具有指定 id 属性
 * @param element JSX 元素
 * @param id id 属性值
 * @returns 是否具有指定 id 属性
 */
export function hasJSXElementId(element: t.JSXElement, id: string): boolean {
  return getJSXElementAttributes(element).some(attr =>
    t.isJSXIdentifier(attr.name) &&
    attr.name.name === 'id' &&
    t.isStringLiteral(attr.value) &&
    attr.value.value === id
  );
}

/**
 * 向JSX元素添加子元素
 * @param element 目标JSX元素
 * @param child 要添加的子元素
 * @returns 添加子元素后的JSX元素
 */
export function appendChildToJSXElement(
  element: t.JSXElement,
  child: t.JSXElement | t.JSXText | t.JSXExpressionContainer
): t.JSXElement {
  element.children.push(child);
  return element;
}

/**
 * 在指定的JSX元素后插入兄弟元素
 * @param target 目标JSX元素
 * @param sibling 要插入的兄弟元素
 * @param parent 父元素
 * @returns 父元素
 */
export function insertSiblingAfterJSXElement(
  target: t.JSXElement,
  sibling: t.JSXElement,
  parent: t.JSXElement
): t.JSXElement {
  const index = parent.children.findIndex(child =>
    t.isJSXElement(child) && child === target
  );
  if (index !== -1) {
    parent.children.splice(index + 1, 0, sibling);
  }
  return parent;
}

/**
 * 在指定的JSX元素前插入兄弟元素
 * @param target 目标JSX元素
 * @param sibling 要插入的兄弟元素
 * @param parent 父元素
 * @returns 父元素
 */
export function insertSiblingBeforeJSXElement(
  target: t.JSXElement,
  sibling: t.JSXElement,
  parent: t.JSXElement
): t.JSXElement {
  const index = parent.children.findIndex(child =>
    t.isJSXElement(child) && child === target
  );
  if (index !== -1) {
    parent.children.splice(index, 0, sibling);
  }
  return parent;
}

/**
 * 替换JSX元素
 * @param oldElement 要替换的元素
 * @param newElement 新元素
 * @param parent 父元素
 * @returns 父元素
 */
export function replaceJSXElement(
  oldElement: t.JSXElement,
  newElement: t.JSXElement,
  parent: t.JSXElement
): t.JSXElement {
  const index = parent.children.findIndex(child =>
    t.isJSXElement(child) && child === oldElement
  );
  if (index !== -1) {
    parent.children[index] = newElement;
  }
  return parent;
}

/**
 * 从父元素中移除JSX元素
 * @param element 要移除的元素
 * @param parent 父元素
 * @returns 父元素
 */
export function removeJSXElement(
  element: t.JSXElement,
  parent: t.JSXElement
): t.JSXElement {
  parent.children = parent.children.filter(child =>
    !(t.isJSXElement(child) && child === element)
  );
  return parent;
}

/**
 * 替换根JSX元素的子元素
 * @param element 根元素
 * @param children 新的子元素数组
 * @returns 根元素
 */
export function replaceRootJSXElementChildren(
  element: t.JSXElement,
  children: Array<t.JSXElement | t.JSXText | t.JSXExpressionContainer>
): t.JSXElement {
  element.children = children;
  return element;
}

/**
 * 添加JSX元素属性
 * @param element JSX元素
 * @param name 属性名
 * @param value 属性值
 * @returns JSX元素
 */
export function addJSXElementAttribute(
  element: t.JSXElement,
  name: string,
  value: t.StringLiteral | t.JSXExpressionContainer
): t.JSXElement {
  const attribute = t.jsxAttribute(
    t.jsxIdentifier(name),
    value
  );
  element.openingElement.attributes.push(attribute);
  return element;
}

/**
 * 更新JSX元素属性
 * @param element JSX元素
 * @param name 属性名
 * @param value 新的属性值
 * @returns JSX元素
 */
export function updateJSXElementAttribute(
  element: t.JSXElement,
  name: string,
  value: t.StringLiteral | t.JSXExpressionContainer
): t.JSXElement {
  const attributes = element.openingElement.attributes;
  const index = attributes.findIndex(
    attr => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === name
  );
  if (index !== -1) {
    const attribute = t.jsxAttribute(t.jsxIdentifier(name), value);
    attributes[index] = attribute;
  }
  return element;
}

/**
 * 批量更新JSX元素属性
 * @param element JSX元素
 * @param attributes 属性对象
 * @returns JSX元素
 */
export function updateJSXAttributes(
  element: t.JSXElement,
  attributes: Record<string, t.StringLiteral | t.JSXExpressionContainer>
): t.JSXElement {
  Object.entries(attributes).forEach(([name, value]) => {
    updateJSXElementAttribute(element, name, value);
  });
  return element;
}

/**
 * 创建JSX元素属性过滤器
 * @param predicate 过滤条件
 * @returns 过滤函数
 */
export function createJSXElementAttributesFilter(
  predicate: (attr: t.JSXAttribute) => boolean
): (element: t.JSXElement) => t.JSXElement {
  return (element: t.JSXElement) => {
    element.openingElement.attributes = element.openingElement.attributes.filter(attr => {
      return !t.isJSXAttribute(attr) || !predicate(attr);
    });
    return element;
  };
}
/**
 * 移除JSX元素属性
 * @param element JSX元素
 * @param name 属性名
 * @returns JSX元素
 */
export function removeJSXElementAttribute(
  element: t.JSXElement,
  name: string
): t.JSXElement {
  element.openingElement.attributes = element.openingElement.attributes.filter(attr => {
    return!t.isJSXAttribute(attr) ||!t.isJSXIdentifier(attr.name) || attr.name.name !== name;
  });
  return element;
}

/**
 * 克隆JSX元素
 * @param element 要克隆的元素
 * @returns 克隆后的元素
 */
export function cloneJSXElement(element: t.JSXElement): t.JSXElement {
  return t.jsxElement(
    t.jsxOpeningElement(
      t.cloneNode(element.openingElement.name),
      element.openingElement.attributes.map(attr => t.cloneNode(attr)),
      element.openingElement.selfClosing
    ),
    element.closingElement ? t.cloneNode(element.closingElement) : null,
    element.children.map(child => t.cloneNode(child))
  );
}