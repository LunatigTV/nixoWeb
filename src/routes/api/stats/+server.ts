import {json} from '@sveltejs/kit';
import {getMapLeaderboards} from '#lib/server/db/stats';
import type {RequestHandler} from './$types';

export const GET: RequestHandler = async ({url}) => {
    const worldId = Number(url.searchParams.get('worldId'));
    if (!worldId) return json({error: 'Missing worldId'}, {status: 400});

    const leaderboards = await getMapLeaderboards(worldId);

    return json(leaderboards);
};