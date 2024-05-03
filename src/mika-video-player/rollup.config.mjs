import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';

export default [{
    input: 'src/index.js',
    output: [
        {
            file: 'dist/index.esm.js',
            format: 'esm'
        },
        {
            file: 'dist/index.cjs.js',
            format: 'cjs'
        }
    ],
    plugins: [
        json(),
        typescript(),
        resolve(),
        commonjs(),
        babel({
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            babelHelpers: 'bundled',
        }),
        postcss({
            extensions: ['.css', '.less'],
            inject: true,
        }),
    ],
    external: ['react', 'react-dom', 'lottie-web'],
}, {
    input: './src/index.d.ts',
    output: {file: 'dist/index.d.ts', format: 'es'},
    plugins: [dts()],
    external: [/\.css$/],
},];
