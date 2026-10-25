import {db} from '$lib/server/db';
import {worlds} from '$lib/server/db/schema';
import {getMapLeaderboards} from '$lib/server/db/stats';
import type {PageServerLoad} from './$types';

export const load: PageServerLoad = async ({url}) => {
    const allWorlds = await db
        .select({id: worlds.id, name: worlds.name})
        .from(worlds)
        .orderBy(worlds.id);

    const selectedWorldId = Number(url.searchParams.get('worldId')) || allWorlds[0]?.id || 1;
    const leaderboards = await getMapLeaderboards(selectedWorldId);

    return {
        worlds: allWorlds,
        selectedWorldId,
        leaderboards
    };
};