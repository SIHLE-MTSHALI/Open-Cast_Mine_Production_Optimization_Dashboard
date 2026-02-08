/*
 * Vitest compatibility shim for Jest-based test runs.
 * This allows legacy `vitest` imports in tests to run under Jest.
 */

const vi = {
  fn: (...args) => jest.fn(...args),
  spyOn: (...args) => jest.spyOn(...args),
  mock: (moduleName, factory) => {
    if (!factory) {
      return jest.mock(moduleName);
    }
    return jest.mock(moduleName, () => {
      const mod = factory();
      if (mod && typeof mod === 'object' && !Object.prototype.hasOwnProperty.call(mod, '__esModule')) {
        return { __esModule: true, ...mod };
      }
      return mod;
    });
  },
  doMock: (moduleName, factory) => {
    if (!factory) {
      return jest.doMock(moduleName);
    }
    return jest.doMock(moduleName, () => {
      const mod = factory();
      if (mod && typeof mod === 'object' && !Object.prototype.hasOwnProperty.call(mod, '__esModule')) {
        return { __esModule: true, ...mod };
      }
      return mod;
    });
  },
  unmock: (...args) => jest.unmock(...args),
  clearAllMocks: () => jest.clearAllMocks(),
  resetAllMocks: () => jest.resetAllMocks(),
  restoreAllMocks: () => jest.restoreAllMocks(),
  resetModules: () => jest.resetModules(),
  useFakeTimers: (...args) => jest.useFakeTimers(...args),
  useRealTimers: () => jest.useRealTimers(),
  setSystemTime: (...args) => jest.setSystemTime(...args),
  advanceTimersByTime: (...args) => jest.advanceTimersByTime(...args),
  stubEnv: (key, value) => {
    process.env[key] = value;
  },
};

module.exports = {
  describe,
  it,
  test,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
};
