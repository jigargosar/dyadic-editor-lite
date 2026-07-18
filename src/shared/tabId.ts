// Shared between main and renderer - crypto.randomUUID() is the Web Crypto
// API, available as a global in both Node (main) and the browser (renderer),
// so this works unmodified in either process.
export function newTabId(): string {
  return 't' + crypto.randomUUID()
}
