// TODO: change this naive implementation

export const isTokenValid = (token = null) => {
  // TODO: see this: https://snyk.io/blog/node-js-timing-attack-ccc-ctf/
  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (token === null) {
    return false;
  }

  if (token.length > 0) {
    return true;
  }

  return false;
};
