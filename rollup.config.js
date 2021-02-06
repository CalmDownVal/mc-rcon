import typescript from '@rollup/plugin-typescript';
import definitions from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

export default [
	{
		input: './src/index.ts',
		output: [
			{
				file: './build/index.cjs.min.js',
				format: 'cjs'
			},
			{
				file: './build/index.esm.min.js',
				format: 'esm'
			}
		],
		external: [
			'@calmdownval/signal'
		],
		plugins: [
			typescript(),
			terser({
				output: {
					comments: false
				}
			})
		]
	},
	{
		input: './src/index.ts',
		output: {
			file: './build/index.d.ts',
			format: 'es'
		},
		external: [
		],
		plugins: [
			definitions()
		]
	}
];
