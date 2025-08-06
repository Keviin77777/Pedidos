// Bloquear TODOS os console em produção
if (typeof window !== 'undefined') {
  // @ts-ignore
  console.log = () => {};
  // @ts-ignore
  console.error = () => {};
  // @ts-ignore
  console.warn = () => {};
  // @ts-ignore
  console.info = () => {};
  // @ts-ignore
  console.debug = () => {};
  // @ts-ignore
  console.trace = () => {};
  // @ts-ignore
  console.group = () => {};
  // @ts-ignore
  console.groupEnd = () => {};
  // @ts-ignore
  console.groupCollapsed = () => {};
  // @ts-ignore
  console.table = () => {};
  // @ts-ignore
  console.time = () => {};
  // @ts-ignore
  console.timeEnd = () => {};
  // @ts-ignore
  console.timeLog = () => {};
  // @ts-ignore
  console.count = () => {};
  // @ts-ignore
  console.countReset = () => {};
  // @ts-ignore
  console.clear = () => {};
  // @ts-ignore
  console.dir = () => {};
  // @ts-ignore
  console.dirxml = () => {};
  // @ts-ignore
  console.assert = () => {};
  // @ts-ignore
  console.profile = () => {};
  // @ts-ignore
  console.profileEnd = () => {};
  // @ts-ignore
  console.timeStamp = () => {};
  // @ts-ignore
  console.memory = {};
}

// Utilitário para desenvolvimento apenas
export const safeConsole = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args);
    }
  }
}; 