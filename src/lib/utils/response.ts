export const responseToOpenai = (message: String) => {
  let msg = {
    type: 'response.create',
    response: {
      instructions: message,
    },
  };
  return msg;
};
