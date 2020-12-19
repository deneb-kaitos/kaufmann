// TODO: change this naive implementation

export const isTokenValid = (token = null) => {
  if (token === null) {
    return false;
  }

  if (token.length > 0) {
    return true;
  }

  return false;
};
