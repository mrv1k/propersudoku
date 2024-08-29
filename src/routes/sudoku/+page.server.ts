import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (({ cookies }) => {

        return {};
}) satisfies PageServerLoad;

export const actions = {
        /**
         * Modify game state in reaction to a keypress. If client-side JavaScript
         * is available, this will happen in the browser instead of here
         */
        update: async ({ request, cookies }) => { },

        /**
         * Modify game state in reaction to a guessed word. This logic always runs on
         * the server, so that people can't cheat by peeking at the JavaScript
         */
        enter: async ({ request, cookies }) => { },

        restart: async ({ cookies }) => {
                cookies.delete('sudoku', { path: '/' });
        }
} satisfies Actions;
