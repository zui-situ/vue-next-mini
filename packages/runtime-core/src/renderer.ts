import { EMPTY_OBJ, isString } from '@vue/shared'
import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { normalizeVNode } from './componentRenderUtils'
import {
  Comment,
  Fragment,
  isSameVNodeType,
  normalizeChildren,
  Text
} from './vnode'

export interface RendererOptions {
  /**
   * 为指定的element 的props打补丁
   */
  patchProp(el: Element, key: string, prevValue: any, nextValue: any): void
  /**
   * 为指定的Element设置text
   */
  setElementText(node: Element, text: string): void
  /**
   * 插入指定的el到parent中，anchor表示插入的位置，即锚点
   */
  insert(el, parent: Element, anchor?): void
  /**
   * 创建element
   */
  createElement(type: string)
  remove(el: Element)
  createText(text: string)
  setText(node, text: string)
  createComment(text: string)
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): any {
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    remove: hostRemove,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment
  } = options

  const processFragment = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      mountChildren(newVNode.children, container, anchor)
    } else {
      patchChildren(oldVNode, newVNode, container, anchor)
    }
  }

  const processCommentNode = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      newVNode.el = hostCreateComment(newVNode.children)
      hostInsert(newVNode.el, container, anchor)
    } else {
      newVNode.el = oldVNode.el
    }
  }

  const processText = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      newVNode.el = hostCreateText(newVNode.children)
      hostInsert(newVNode.el, container, anchor)
    } else {
      const el = (newVNode.el = oldVNode.el!)
      if (newVNode.children !== oldVNode.children) {
        hostSetText(el, newVNode.children)
      }
    }
  }

  const processElement = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      mountElement(newVNode, container, anchor)
    } else {
      //TODO:更新操作
      patchElement(oldVNode, newVNode)
    }
  }
  const mountElement = (vnode, container, anchor) => {
    const { type, props, shapeFlag } = vnode
    // 1. 创建element
    const el = (vnode.el = hostCreateElement(type))

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 2. 设置文本
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    }
    // 3. 设置props
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 4. 插入
    hostInsert(el, container, anchor)
  }

  const patchElement = (oldVNode, newVNode) => {
    const el = (newVNode.el = oldVNode.el)

    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    patchChildren(oldVNode, newVNode, el, null)

    patchProps(el, newVNode, oldProps, newProps)
  }

  const mountChildren = (children, container, anchor) => {
    if (isString(children)) {
      children = children.split('')
    }
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container, anchor)
    }
  }

  const patchChildren = (oldVNode, newVNode, container, anchor) => {
    const c1 = oldVNode && oldVNode.children
    const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0
    const c2 = newVNode && newVNode.children
    const { shapeFlag } = newVNode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & prevShapeFlag.ARRAY_CHILDREN) {
        // TODO:卸载旧子节点
      }
      if (c2 !== c1) {
        //挂载新子节点的文本
        hostSetElementText(container, c2)
      }
    } else {
      if (prevShapeFlag & prevShapeFlag.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: diff
        } else {
          // TODO: 卸载
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 删除旧节点的 text
          hostSetElementText(container, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: 单独新子节点挂载
        }
      }
    }
  }

  const patchProps = (el: Element, vnode, oldProps, newProps) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        if (next !== prev) {
          hostPatchProp(el, key, prev, next)
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          // 把不存在于新props的就props删除
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  const patch = (oldVNode, newVNode, container, anchor = null) => {
    if (oldVNode === newVNode) {
      return
    }

    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      unmount(oldVNode)
      oldVNode = null
    }

    const { type, shapeFlag } = newVNode

    switch (type) {
      case Text:
        processText(oldVNode, newVNode, container, anchor)
        break
      case Comment:
        processCommentNode(oldVNode, newVNode, container, anchor)
        break
      case Fragment:
        processFragment(oldVNode, newVNode, container, anchor)
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVNode, newVNode, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
        }
    }
  }

  const unmount = vnode => {
    hostRemove(vnode.el)
  }

  const render = (vnode, container) => {
    if (vnode === null) {
      // TODO:卸载
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }
  return {
    render
  }
}
