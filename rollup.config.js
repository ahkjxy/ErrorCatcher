import { terser } from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/error-catcher.js',
        format: 'umd',
        name: 'ErrorTracker',
        exports: 'named'
      },
      {
        file: 'dist/error-catcher.min.js',
        format: 'umd',
        name: 'ErrorTracker',
        exports: 'named',
        plugins: [terser()]
      },
      {
        file: 'dist/error-catcher.esm.js',
        format: 'es'
      },
      {
        file: 'dist/error-catcher.cjs.js',
        format: 'cjs',
        exports: 'named'
      }
    ],
    plugins: [
      resolve(),
      commonjs()
    ]
  }
];
