/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: [
    "<rootDir>/src/__tests__/MockData",
    "<rootDir>/src/__tests__/MockResults",
  ],
  // TODO: re-enable this and fix typing
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
};
