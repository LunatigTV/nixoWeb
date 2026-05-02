import db from "$lib/server/init-db";
import type {World} from "$lib/model/world";

export interface PlayerWorldStatSummary {
    worldId: number;
    world: string;
    valuesByKey: Record<string, number>;
    total: number;
}

export interface TopBlockStatEntry {
    key: string;
    total: number;
}

export interface PlayerTopBlockStatsResult {
    mined: TopBlockStatEntry[];
    placed: TopBlockStatEntry[];
}

interface PlayerWorldStatRow {
    world_id: number;
    stat_key: string;
    stat_value: number;
}

/**
 * Returns one aggregated stats object per world for the requested stat keys.
 */
export function getPlayerStatsPerWorld(playerId: number, statKeys: string[]): PlayerWorldStatSummary[] {
    const worlds = db
        .prepare(
            `
                SELECT id, name, is_active
                FROM worlds
                ORDER BY id ASC
            `
        )
        .all() as World[];

    if (statKeys.length === 0) {
        return worlds.map((world) => ({
            worldId: world.id,
            world: world.name,
            valuesByKey: {},
            total: 0
        }));
    }

    const placeholders = statKeys.map(() => "?").join(", ");
    const rows = db
        .prepare(
            `
                SELECT ps.world_id, st.name as stat_key, SUM(ps.stat_value) as stat_value
                FROM player_stats ps
                         JOIN stat_types st ON st.id = ps.stat_type_id
                WHERE ps.player_id = ?
                  AND st.name IN (${placeholders})
                GROUP BY ps.world_id, st.name
            `
        )
        .all(playerId, ...statKeys) as PlayerWorldStatRow[];

    const valuesByWorldId = rows.reduce<Record<number, Record<string, number>>>((acc, row) => {
        (acc[row.world_id] ??= {})[row.stat_key] = Number(row.stat_value ?? 0);
        return acc;
    }, {});

    return worlds.map((world) => {
        const valuesByKey = Object.fromEntries(statKeys.map((key) => [key, valuesByWorldId[world.id]?.[key] ?? 0]));
        const total = Object.values(valuesByKey).reduce((sum, value) => sum + value, 0);

        return {
            worldId: world.id,
            world: world.name,
            valuesByKey,
            total
        };
    });
}

function getTopPlayerStatsByGroup(
    playerId: number,
    groupName: string,
    limit: number,
    requireAlsoMined = false
): TopBlockStatEntry[] {
    const groupIdRow = db
        .prepare(
            `
                SELECT id
                FROM stat_groups
                WHERE name = ?
            `
        )
        .get(groupName) as { id: number } | undefined;

    if (!groupIdRow) {
        return [];
    }

    const minedFilterClause = requireAlsoMined
        ? `
              AND EXISTS (
                  SELECT 1
                  FROM player_stats ps2
                           JOIN stat_groups sg2 ON sg2.id = ps2.stat_group_id
                  WHERE ps2.player_id = ps.player_id
                    AND ps2.stat_type_id = ps.stat_type_id
                    AND sg2.name = 'minecraft:mined'
              )
          `
        : "";

    const rows = db.prepare(
        `
            SELECT st.name AS stat_key, SUM(ps.stat_value) AS total
            FROM player_stats ps
                     JOIN stat_types st ON st.id = ps.stat_type_id
            WHERE ps.player_id = ?
              AND ps.stat_group_id = ? ${minedFilterClause}
            GROUP BY st.name
            ORDER BY total DESC, st.name ASC
                LIMIT ?
        `
    ).all(playerId, groupIdRow.id, limit) as Array<{ stat_key: string; total: number }>;

    return rows.map((row) => ({
        key: row.stat_key,
        total: Number(row.total ?? 0)
    }));
}

export function getTopPlayerBlockStats(playerId: number, limit = 5): PlayerTopBlockStatsResult {
    return {
        mined: getTopPlayerStatsByGroup(playerId, "minecraft:mined", limit, false),
        placed: getTopPlayerStatsByGroup(playerId, "minecraft:used", limit, true)
    };
}

