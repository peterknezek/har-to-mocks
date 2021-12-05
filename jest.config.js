module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['<rootDir>/tests/**/*.ts', '<rootDir>/src/**/*.test.ts'],
  transform: {'\\.ts$': 'ts-jest'},
  coverageReporters: ['lcov', 'text-summary'],
  collectCoverage: false, // !!`Boolean(process.env.CI)`,
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/templates/'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
}
