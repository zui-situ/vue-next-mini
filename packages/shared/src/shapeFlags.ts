export const enum ShapeFlags {
  // 表示元素类型，值为 1
  ELEMENT = 1,
  // 表示函数式组件类型，值为 1 << 1，即 2
  FUNCTIONAL_COMPONENT = 1 << 1,
  // 表示有状态组件类型，值为 1 << 2，即 4。
  STATEFUL_COMPONENT = 1 << 2,
  // 表示文本子节点类型，值为 1 << 3，即 8。
  TEXT_CHILDREN = 1 << 3,
  // 表示数组子节点类型，值为 1 << 4，即 16。
  ARRAY_CHILDREN = 1 << 4,
  // 表示插槽子节点类型，值为 1 << 5，即 32。
  SLOTS_CHILDREN = 1 << 5,
  // 表示传送门类型，值为 1 << 6，即 64。
  TELEPORT = 1 << 6,
  // 表示悬念类型，值为 1 << 7，即 128。
  SUSPENSE = 1 << 7,
  // 表示应保持活跃的组件类型，值为 1 << 8，即 256。
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  // 表示已保持活跃的组件类型，值为 1 << 9，即 512。
  COMPONENT_KEPT_ALIVE = 1 << 9,
  // 表示组件类型，值为 ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT，即 6。
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
