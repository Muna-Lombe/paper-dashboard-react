export const telegrafResponseBuilder = (res: { headers: Headers; body: any; status: number }) => {
  let writableEnded = false;
  const modRes = Object.assign(res, {
    headersSent: false,
    setHeader: (name: string, value: string) => res.headers.set(name, value),
    end: (data: any) => {
      if (writableEnded) return;
      res.body = data;
      writableEnded = true;
    },
  });
  Object.defineProperty(modRes, 'writableEnded', {
    get: () => writableEnded,
  });
  return modRes;
};
