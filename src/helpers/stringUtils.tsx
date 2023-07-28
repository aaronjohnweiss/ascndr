export const shorten = (str, n) => {
  if (n < 4) return str.slice(0, n)
  if (str.length <= n) return str
  return str.slice(0, n - 3) + '...'
}
