module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { 
        node: 'current' 
      }
    }],
    ['@babel/preset-typescript', {
      isTSX: false,
      allExtensions: true,
      allowNamespaces: true
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
}; 