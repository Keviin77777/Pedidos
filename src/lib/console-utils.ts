// Utilitário para bloquear console.log em produção
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

// Bloquear console em produção
if (process.env.NODE_ENV === 'production') {
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
} 