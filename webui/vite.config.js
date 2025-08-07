import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        outDir: '../module/webroot',
        // minify: false,
        // terserOptions: {
        //   keep_classnames: true,
        //   keep_fnames: true
        // },
    }
});
