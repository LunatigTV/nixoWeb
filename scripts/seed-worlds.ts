import * as dotenv from 'dotenv';

dotenv.config();

import {db} from '../src/lib/server/db';
import {
    versions,
    worlds,
    players,
    statGroups,
    statTypes,
    playerStats,
    advancementCategories,
    advancementFrames,
    advancements,
    playerAdvancements
} from '../src/lib/server/db/schema';
import {eq} from 'drizzle-orm';
import fs from 'fs-extra';
import path from 'path';

// --- Paths ---
const DATA_DIR = path.join(process.cwd(), 'archive');
const WORLDS_DIR = path.join(DATA_DIR, 'worlds');
const VERSIONS_DIR = path.join(DATA_DIR, 'versions');
const WORLDS_JSON = path.join(DATA_DIR, 'worlds.json');

// --- Helper: Mojang API Username Fetcher ---
const usernameCache = new Map<string, string>();

async function fetchMojangUsername(uuid: string): Promise<string> {
    const formattedUuid = uuid.replace(/-/g, '');
    if (usernameCache.has(formattedUuid)) return usernameCache.get(formattedUuid)!;

    try {
        const res = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${formattedUuid}`);
        if (res.ok) {
            const data = (await res.json()) as { name: string };
            if (data.name) {
                usernameCache.set(formattedUuid, data.name);
                return data.name;
            }
        }
    } catch (err) {
        console.warn(`⚠️ Could not fetch Mojang username for UUID ${uuid}, using fallback.`);
    }

    const fallback = `Player_${uuid.substring(0, 8)}`;
    usernameCache.set(formattedUuid, fallback);
    return fallback;
}

// Helper delay to respect Mojang API rate limits
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    console.log('🚀 Starting historic data seed...\n');

    // Cache maps
    const versionMap = new Map<string, number>();     // "1.20.6" -> id
    const worldMap = new Map<string, number>();       // "NixoCraft_1" -> id
    const playerMap = new Map<string, number>();      // uuid -> id
    const statTypeCache = new Map<string, number>();  // "minecraft:diamond_ore" -> id
    const frameMap = new Map<string, number>();       // "task" -> id
    const categoryMap = new Map<string, number>();    // "minecraft:story" -> id
    const advKeyMap = new Map<string, number>();      // "minecraft:story/mine_stone" -> id

    // -----------------------------------------------------
    // 1. Seed Base Advancement Frames
    // -----------------------------------------------------
    const defaultFrames = ['task', 'goal', 'challenge'];
    for (const frameName of defaultFrames) {
        let [frame] = await db.select().from(advancementFrames).where(eq(advancementFrames.name, frameName));
        if (!frame) {
            const [res] = await db.insert(advancementFrames).values({name: frameName});
            frameMap.set(frameName, res.insertId);
        } else {
            frameMap.set(frameName, frame.id);
        }
    }

    // -----------------------------------------------------
    // 2. Parse /data/worlds.json and Seed Versions & Worlds
    // -----------------------------------------------------
    if (await fs.pathExists(WORLDS_JSON)) {
        const worldsData = await fs.readJson(WORLDS_JSON);
        console.log(`📜 Seeding ${worldsData.length} worlds from worlds.json...`);

        for (const w of worldsData) {
            // Version
            let [verRecord] = await db.select().from(versions).where(eq(versions.version, w.version));
            if (!verRecord) {
                const [res] = await db.insert(versions).values({version: w.version});
                verRecord = {id: res.insertId, version: w.version};
            }
            versionMap.set(w.version, verRecord.id);

            // Map "NixoCraft 1" -> "NixoCraft_1" folder key
            const folderKey = w.name.replace(/\s+/g, '_');

            // World
            let [worldRecord] = await db.select().from(worlds).where(eq(worlds.name, folderKey));
            if (!worldRecord) {
                const [res] = await db.insert(worlds).values({
                    name: w.name,
                    description: w.description,
                    imageUrl: w.imageUrl || null,
                    downloadUrl: w.downloadUrl || null,
                    isActive: w.isActive,
                    versionId: verRecord.id
                });
                worldMap.set(folderKey, res.insertId);
            } else {
                worldMap.set(folderKey, worldRecord.id);
            }
        }
    }
// -----------------------------------------------------
    // 3. Seed Advancements Metadata from /data/versions/*.json
    // -----------------------------------------------------
    if (await fs.pathExists(VERSIONS_DIR)) {
        const versionFiles = (await fs.readdir(VERSIONS_DIR)).filter((f) => f.endsWith('.json'));
        console.log(`\n📚 Seeding advancement definitions from ${versionFiles.length} version files...`);

        for (const file of versionFiles) {
            const rawAdvData = await fs.readJson(path.join(VERSIONS_DIR, file));

            // Loop through categories (adventure, end, husbandry, nether, story)
            for (const [categoryName, categoryAdvancements] of Object.entries<Record<string, any>>(rawAdvData)) {
                if (typeof categoryAdvancements !== 'object') continue;

                // Ensure category exists
                if (!categoryMap.has(categoryName)) {
                    let [cat] = await db.select().from(advancementCategories).where(eq(advancementCategories.name, categoryName));
                    if (!cat) {
                        const [res] = await db.insert(advancementCategories).values({
                            name: categoryName,
                            backgroundTexture: `textures/gui/advancements/backgrounds/${categoryName}.png`
                        });
                        categoryMap.set(categoryName, res.insertId);
                    } else {
                        categoryMap.set(categoryName, cat.id);
                    }
                }

                const categoryId = categoryMap.get(categoryName)!;

                // Loop through each advancement inside the category
                for (const [advSubKey, advData] of Object.entries<any>(categoryAdvancements)) {
                    // Construct full Minecraft namespace key: "minecraft:story/mine_stone"
                    const keyName = `minecraft:${categoryName}/${advSubKey}`;

                    // Format clean title from translation string or subkey
                    // "advancements.story.mine_stone.title" -> "Mine Stone"
                    const title = advSubKey
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase());

                    const description = advData.description || '';
                    const iconItem = advData.icon || 'minecraft:book';
                    const frameName = advData.frame || 'task';
                    const frameId = frameMap.get(frameName) || frameMap.get('task')!;

                    let [existingAdv] = await db.select().from(advancements).where(eq(advancements.keyName, keyName));
                    if (!existingAdv) {
                        const [res] = await db.insert(advancements).values({
                            keyName,
                            iconItem,
                            title,
                            description,
                            frameId,
                            categoryId,
                            parentId: null
                        });
                        advKeyMap.set(keyName, res.insertId);
                        console.log(`  ➕ Added Advancement: ${keyName}`);
                    } else {
                        advKeyMap.set(keyName, existingAdv.id);
                    }
                }
            }
        }
    }

    // Pre-fill cache maps from DB
    const existingTypes = await db.select().from(statTypes);
    for (const t of existingTypes) statTypeCache.set(t.minecraftId, t.id);

    const existingPlayers = await db.select().from(players);
    for (const p of existingPlayers) playerMap.set(p.uuid, p.id);

    // -----------------------------------------------------
    // 4. Process Player Stats and Advancements in Worlds
    // -----------------------------------------------------
    if (await fs.pathExists(WORLDS_DIR)) {
        const worldFolders = await fs.readdir(WORLDS_DIR);

        for (const worldFolder of worldFolders) {
            const worldDbId = worldMap.get(worldFolder);
            if (!worldDbId) continue;

            const worldPath = path.join(WORLDS_DIR, worldFolder);
            const statPath = path.join(worldPath, 'stats');
            const advPath = path.join(worldPath, 'advancements');

            console.log(`\n🌍 Importing player data for ${worldFolder}...`);

            // A. STATS
            if (await fs.pathExists(statPath)) {
                const statFiles = (await fs.readdir(statPath)).filter((f) => f.endsWith('.json'));

                for (const statFile of statFiles) {
                    const uuid = statFile.replace('.json', '');
                    const playerDbId = await getOrCreatePlayer(uuid, playerMap);

                    const rawJson = await fs.readJson(path.join(statPath, statFile));
                    const statsObj = rawJson.stats || {};

                    const statsToInsert: {
                        worldId: number;
                        playerId: number;
                        statTypeId: number;
                        statValue: number
                    }[] = [];

                    for (const [groupKey, items] of Object.entries<Record<string, number>>(statsObj)) {
                        const statGroupDbId = await getOrCreateStatGroup(groupKey);

                        for (const [mcId, val] of Object.entries(items)) {
                            const statTypeDbId = await getOrCreateStatType(mcId, statGroupDbId, statTypeCache);
                            statsToInsert.push({
                                worldId: worldDbId,
                                playerId: playerDbId,
                                statTypeId: statTypeDbId,
                                statValue: val
                            });
                        }
                    }

                    if (statsToInsert.length > 0) {
                        await db.insert(playerStats)
                            .values(statsToInsert)
                            .onDuplicateKeyUpdate({set: {statValue: playerStats.statValue}});
                    }
                }
            }

            // B. ADVANCEMENTS
            if (await fs.pathExists(advPath)) {
                const advFiles = (await fs.readdir(advPath)).filter((f) => f.endsWith('.json'));

                for (const advFile of advFiles) {
                    const uuid = advFile.replace('.json', '');
                    const playerDbId = await getOrCreatePlayer(uuid, playerMap);

                    const rawJson = await fs.readJson(path.join(advPath, advFile));
                    const advsToInsert: {
                        advancementId: number;
                        worldId: number;
                        playerId: number;
                        dateAchieved: Date
                    }[] = [];

                    for (const [advKey, advData] of Object.entries<any>(rawJson)) {
                        if (!advKey.includes(':') || typeof advData !== 'object') continue;

                        if (advData.done && advKeyMap.has(advKey)) {
                            const dates = Object.values<string>(advData.criteria || {}).map((d) => new Date(d));
                            const latestDate = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date();

                            advsToInsert.push({
                                advancementId: advKeyMap.get(advKey)!,
                                worldId: worldDbId,
                                playerId: playerDbId,
                                dateAchieved: latestDate
                            });
                        }
                    }

                    if (advsToInsert.length > 0) {
                        await db.insert(playerAdvancements)
                            .values(advsToInsert)
                            .onDuplicateKeyUpdate({set: {dateAchieved: playerAdvancements.dateAchieved}});
                    }
                }
            }
        }
    }

    console.log('\n✅ All historical world data, metadata, and player stats imported successfully!');
    process.exit(0);
}

// --- Helper Functions ---

async function getOrCreatePlayer(uuid: string, cache: Map<string, number>): Promise<number> {
    if (cache.has(uuid)) return cache.get(uuid)!;

    let [player] = await db.select().from(players).where(eq(players.uuid, uuid));
    if (!player) {
        const name = await fetchMojangUsername(uuid);
        await sleep(100); // Friendly rate-limiting for Mojang API
        const [res] = await db.insert(players).values({uuid, name});
        player = {id: res.insertId, uuid, name};
        console.log(`👤 Resolved UUID ${uuid} -> ${name}`);
    }

    cache.set(uuid, player.id);
    return player.id;
}

async function getOrCreateStatGroup(groupName: string): Promise<number> {
    const cleanName = groupName.replace('minecraft:', '');
    let [group] = await db.select().from(statGroups).where(eq(statGroups.name, cleanName));
    if (!group) {
        const [res] = await db.insert(statGroups).values({name: cleanName});
        return res.insertId;
    }
    return group.id;
}

async function getOrCreateStatType(mcId: string, groupId: number, cache: Map<string, number>): Promise<number> {
    if (cache.has(mcId)) return cache.get(mcId)!;

    let [type] = await db.select().from(statTypes).where(eq(statTypes.minecraftId, mcId));
    if (!type) {
        const cleanName = mcId.replace('minecraft:', '').replace(/_/g, ' ');
        const [res] = await db.insert(statTypes).values({
            name: cleanName,
            minecraftId: mcId,
            statGroupId: groupId,
            iconType: 'item'
        });
        cache.set(mcId, res.insertId);
        return res.insertId;
    }

    cache.set(mcId, type.id);
    return type.id;
}

main().catch((err) => {
    console.error('❌ Error during database seed:', err);
    process.exit(1);
});