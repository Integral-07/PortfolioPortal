let resolve: () => void
const promise = new Promise<void>((r) => {
  resolve = r
})
let loaded = false

export function notifyClerkLoaded() {
  if (loaded) return
  loaded = true
  resolve()
}

export function suspendUntilClerkLoaded() {
  if (!loaded) throw promise
}
