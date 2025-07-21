import { defineConfig } from 'vite';

export default defineConfig({
    base: '',
    build: {
        outDir: '../module/webroot',
        rollupOptions: {
            input: {
                main: 'index.html',
                hosts: 'hosts.html',
                more: 'more.html'
            }
        }
    }
});
