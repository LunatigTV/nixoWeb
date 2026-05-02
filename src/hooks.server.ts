import {initDatabase} from "$lib/server/init-db";

/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
    initDatabase();
}

