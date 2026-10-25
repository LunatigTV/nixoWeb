import {db} from '$lib/server/db';
import {players, playerStats, statTypes} from '$lib/server/db/schema';
import {eq, and, desc, sql, inArray} from 'drizzle-orm';

// Definition for a single leaderboard type
export interface LeaderboardConfig {
    id: string;
    title: string;
    icon: string;
    statMcId: string;
    statMcIdAlts?: string[];
    formatValue: (val: number) => string;
}

// 1. Add new stats here! The UI will render them automatically.
export const LEADERBOARD_CONFIGS: LeaderboardConfig[] = [
    {
        id: 'playtime',
        title: 'Top 10 Spielzeit',
        icon: '⏱️',
        statMcId: 'play_time',
        statMcIdAlts: ['play_one_minute'],
        formatValue: (val) => `${(val / 72000).toFixed(1)} Std.`
    },
    {
        id: 'deaths',
        title: 'Top 10 Tode',
        icon: '💀',
        statMcId: 'deaths',
        formatValue: (val) => `${val.toLocaleString()} Tode`
    },
    {
        id: 'mob_kills',
        title: 'Top 10 Mob Kills',
        icon: '⚔️',
        statMcId: 'mob_kills',
        statMcIdAlts: ['mobKills'],
        formatValue: (val) => `${val.toLocaleString()} Kills`
    },

];

export interface LeaderboardEntry {
    playerId: number;
    uuid: string;
    name: string;
    statValue: number;
    displayValue: string;
}

export interface LeaderboardGroup {
    id: string;
    title: string;
    icon: string;
    entries: LeaderboardEntry[];
}

export async function getTop10ForStat(worldId: number, config: LeaderboardConfig): Promise<LeaderboardGroup> {
    const validIds = [config.statMcId, `minecraft:${config.statMcId}`];

    if (config.statMcIdAlts) {
        for (const alt of config.statMcIdAlts) {
            validIds.push(alt, `minecraft:${alt}`);
        }
    }

    const rawRows = await db
        .select({
            playerId: players.id,
            uuid: players.uuid,
            name: players.name,
            statValue: sql<number>`SUM(
            ${playerStats.statValue}
            )`.mapWith(Number)
        })
        .from(playerStats)
        .innerJoin(players, eq(playerStats.playerId, players.id))
        .innerJoin(statTypes, eq(playerStats.statTypeId, statTypes.id))
        .where(
            and(
                eq(playerStats.worldId, worldId),
                inArray(statTypes.minecraftId, validIds)
            )
        )
        .groupBy(players.id, players.uuid, players.name)
        .orderBy(desc(sql`SUM(
        ${playerStats.statValue}
        )`))
        .limit(10);

    return {
        id: config.id,
        title: config.title,
        icon: config.icon,
        entries: rawRows.map((r) => ({
            ...r,
            displayValue: config.formatValue(r.statValue)
        }))
    };
}

/** Fetches all configured leaderboards dynamically */
export async function getMapLeaderboards(worldId: number): Promise<LeaderboardGroup[]> {
    return await Promise.all(
        LEADERBOARD_CONFIGS.map((config) => getTop10ForStat(worldId, config))
    );
}