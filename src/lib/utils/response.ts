export const responseToOpenai = (message: string) => {
  let msg = {
    type: 'response.create',
    response: {
      instructions: message,
    },
  };
  return msg;
};
