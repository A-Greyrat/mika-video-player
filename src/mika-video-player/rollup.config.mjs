import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.esm.js',
        format: 'esm',
      },
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
      },
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
      terser({
        mangle: true, // 修改变量名以减小文件大小
        compress: {
          sequences: true, // 使用逗号操作符来合并语句
          dead_code: true, // 移除无法访问的代码
          conditionals: true, // 优化 if-s 和条件表达式
          booleans: true, // 优化布尔表达式
          unused: true, // 移除未被使用的代码
          if_return: true, // 优化 if/return 和 if/continue
          join_vars: true, // 加入连续 var 声明
          drop_console: true, // 移除 console 语句
          collapse_vars: true, // 合并定义了但只有在其它地方使用的变量
          reduce_vars: true, // 尝试去除用于定义全局变量的 var 语句
          loops: true, // 优化循环
          hoist_funs: true, // 提升函数声明
          keep_fargs: false, // 移除未被使用的函数参数
          keep_fnames: false, // 不保留函数名
          drop_debugger: true, // 移除 debugger 语句
          pure_getters: 'strict', // 假定对象的 getter 不产生副作用
          pure_funcs: null, // 声明哪些函数是“纯粹”的
          booleans_as_integers: true, // 将布尔值转换为整数
        },
        output: {
          beautify: false, // 美化输出
          comments: false, // 不保留注释
        },
        toplevel: false, // 最高级别（针对ES6模块和脚本）
        nameCache: null, // 压缩时的缓存文件
      }),
    ],
    external: ['react', 'react-dom', 'lottie-web'],
  },
  {
    input: './src/index.d.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts()],
    external: [/\.css$/],
  },
];
