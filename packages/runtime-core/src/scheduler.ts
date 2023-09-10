let ifFlushPending = false

const resolvedPromise = Promise.resolve() as Promise<any>

let currentFlushPromise: Promise<void> | null = null

const pendingPreFlushCbs: Function[] = []

// 将预刷新回调函数添加到预刷新回调队列中
export function queuePreFlushCb(cb: Function) {
  queueCb(cb, pendingPreFlushCbs)
}

function queueCb(cb: Function, pendingQueue: Function[]) {
  pendingQueue.push(cb)
  queueFlush()
}

function queueFlush() {
  if (!ifFlushPending) {
    ifFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

function flushJobs() {
  ifFlushPending = false
  flushPreFlushCbs()
}

export function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {
    let activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
    pendingPreFlushCbs.length = 0

    for (let i = 0; i < activePreFlushCbs.length; i++) {
      activePreFlushCbs[i]()
    }
  }
}
