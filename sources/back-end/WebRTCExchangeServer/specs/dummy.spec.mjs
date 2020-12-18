import mocha from 'mocha';
import chai from 'chai';

const {
  describe,
  it,
} = mocha;
const {
  expect,
} = chai;

describe('dummy', () => {
  it('should just pass', async () => {
    expect(true).to.be.true;
  });
});
