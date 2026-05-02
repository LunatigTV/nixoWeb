import db from "$lib/server/init-db";
import {error} from "@sveltejs/kit";
import type {PageServerLoad} from "./$types";
import type {Player} from "$lib/model/player";
import {getPlayerStatsPerWorld, getTopPlayerBlockStats} from "$lib/server/player-stats";
import {getPlayerAdvancementsPerWorld} from "$lib/server/player-advancements";

const PLAYTIME_KEYS = ["minecraft:play_time", "minecraft:play_one_minute"];
const MOB_KILL_KEYS = ["minecraft:mob_kills"];


export const load: PageServerLoad = ({params}) => {
    const {uuid} = params;

    const player = db
        .prepare(`
            SELECT id, uuid, name
            FROM players
            WHERE uuid = ?
            ORDER BY id DESC LIMIT 1
        `)
        .get(uuid) as Player | undefined;

    if (!player) {
        throw error(404, "Player not found");
    }

    const playtimeStatsPerWorld = getPlayerStatsPerWorld(player.id, PLAYTIME_KEYS);
    const mobkillStatsPerWorld = getPlayerStatsPerWorld(player.id, MOB_KILL_KEYS);
    const advancements = getPlayerAdvancementsPerWorld(player.id);
    const blockStats = getTopPlayerBlockStats(player.id, 5);

    return {
        player,
        playtimeStatsPerWorld,
        mobkillStatsPerWorld,
        totalAdvancements: advancements.total,
        advancementsPerWorld: advancements.perWorld,
        topMinedBlocks: blockStats.mined,
        topPlacedBlocks: blockStats.placed
    };
};
