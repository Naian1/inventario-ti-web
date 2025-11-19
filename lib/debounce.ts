export default function debounce<T extends (...args: any[]) => any>(fn: T, wait = 200) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const wrapped = function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
  wrapped.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };
  return wrapped as T & { cancel: () => void };
}
