import db from "$lib/server/init-db";
import type {World} from "$lib/model/world";

export interface AdvancementWithCategory {
    name: string;
    categoryName: string;
}

export interface PlayerWorldAdvancementSummary {
    worldId: number;
    world: string;
    advancements: AdvancementWithCategory[];
    total: number;
}

export interface PlayerAdvancementsResult {
    total: number;
    perWorld: PlayerWorldAdvancementSummary[];
}

interface PlayerWorldAdvancementRow {
    world_id: number;
    advancement_name: string;
    category_name: string;
}

/**
 * Returns total advancements and the advancement list per world for one player.
 */
export function getPlayerAdvancementsPerWorld(playerId: number): PlayerAdvancementsResult {
    const worlds = db
        .prepare(
            `
                SELECT id, name, is_active
                FROM worlds
                ORDER BY id ASC
            `
        )
        .all() as World[];

    const rows = db
        .prepare(
            `
                SELECT pa.world_id,
                       a.name                       AS advancement_name,
                       COALESCE(ac.name, 'unknown') AS category_name
                FROM player_advancements pa
                         JOIN advancements a ON a.id = pa.advancement_id
                         LEFT JOIN advancement_category ac ON ac.id = a.category_id
                WHERE pa.player_id = ?
                ORDER BY pa.world_id ASC, a.name ASC
            `
        )
        .all(playerId) as PlayerWorldAdvancementRow[];

    const advancementsByWorldId = rows.reduce<Record<number, Set<string>>>((acc, row) => {
        (acc[row.world_id] ??= new Set()).add(row.advancement_name);
        return acc;
    }, {});

    const advancementDetailsByWorldId = rows.reduce<Record<number, Map<string, AdvancementWithCategory>>>((acc, row) => {
        const worldMap = (acc[row.world_id] ??= new Map<string, AdvancementWithCategory>());
        if (!worldMap.has(row.advancement_name)) {
            worldMap.set(row.advancement_name, {
                name: row.advancement_name,
                categoryName: row.category_name
            });
        }
        return acc;
    }, {});

    const perWorld = worlds.map((world) => {
        const advancements = Array.from(advancementDetailsByWorldId[world.id]?.values() ?? []);

        return {
            worldId: world.id,
            world: world.name,
            advancements,
            total: advancements.length
        };
    });

    const total = perWorld.reduce((sum, world) => sum + world.total, 0);

    return {
        total,
        perWorld
    };
}
