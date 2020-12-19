import generate from 'nanoid-generate';

export const WsConstants = Object.freeze({
  key: `__${generate.nolookalikes(12)}__`,
});
