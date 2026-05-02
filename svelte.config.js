import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';

/** @type {{preprocess: *, kit: {adapter: Promise<void>}}} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {}
};

export default config;
