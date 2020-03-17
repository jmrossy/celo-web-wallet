module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      // This informs ts-jest to transform the output with babel
      // after compilation. This is necessary to get the transforms 
      // like Emotion's working in tests
      babelConfig: true
    }
  }
};