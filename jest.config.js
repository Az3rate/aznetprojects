module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '^react-syntax-highlighter/dist/esm/styles/prism': 'react-syntax-highlighter/dist/cjs/styles/prism'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-syntax-highlighter)/)'
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}; 