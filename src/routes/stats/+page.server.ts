import db from '$lib/server/init-db';
import type {Player} from "$lib/model/player";

export function load(): Player[] {
    const allPlayers = db.prepare(`
        SELECT id, uuid, name
        FROM players
        ORDER BY id DESC
    `).all() as Player[];

    return {
        allPlayers
    };
}