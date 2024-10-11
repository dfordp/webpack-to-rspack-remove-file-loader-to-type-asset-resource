Rspack implements Webpack 5's Asset Modules, using asset modules to replace file-loader to 'asset/resource' for better performance.

### Before

```ts
module.exports = {
  module: {
    rules: [{
      use: ['file-loader'],
    }, ],
  },
};
```

### After

```ts
module.exports = {
  module: {
    rules: [{
      type: 'asset/resource',
    }, ],
  },
};
```

