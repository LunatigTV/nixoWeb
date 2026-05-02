import Database from 'better-sqlite3';
import {readdirSync, readFileSync} from 'node:fs';
import path, {dirname, isAbsolute, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {env} from '$env/dynamic/private';
import type {Advancement} from "$lib/model/advancement.ts";
import type {Stat_group} from "$lib/model/stat_group";
import type {Stat_type} from "$lib/model/stat_type";
import type {Stat_type_group} from "$lib/model/stat_type_group";
import type {Player} from "$lib/model/player";
import type {Advancement_category} from "$lib/model/advancement_category";

const dbPath = env.DATABASE_PATH || './nixocraft_stats.sqlite';
const ARCHIVE_PATH = './static/archive';

const defaultScheworldath = resolve(dirname(fileURLToPath(import.meta.url)), 'schema.sql');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

export default db;

function getScheworldath() {
    if (!env.DATABASE_SCHEMA_PATH) {
        return defaultScheworldath;
    }

    return isAbsolute(env.DATABASE_SCHEMA_PATH) ? env.DATABASE_SCHEMA_PATH : resolve(process.cwd(), env.DATABASE_SCHEMA_PATH);
}

function loadSchemaSql() {
    const scheworldath = getScheworldath();

    try {
        return readFileSync(scheworldath, 'utf8');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Could not read SQL schema file at ${scheworldath}: ${message}`);
    }
}

async function getPlayerWithPlayerDB(uuid: string): Promise<string | null> {
    try {
        const response = await fetch(`https://playerdb.co/api/player/minecraft/${uuid}`, {
            method: 'GET',
            headers: {'User-Agent': 'NixoWeb/1.0 (fienix_and_izio@gmail.com)'}
        });
        const data = await response.json();
        return data.success ? data.data.player.username : null;
    } catch {
        return null;
    }
}

function getAdvancementCategoryName(advancementKey: string) {
    const normalized = advancementKey.startsWith('minecraft:')
        ? advancementKey.slice('minecraft:'.length)
        : advancementKey;

    const [category] = normalized.split('/');
    return category?.trim() || 'unknown';
}

function normalizeAdvancementName(advancementKey: string) {
    let normalized = advancementKey.startsWith('minecraft:')
        ? advancementKey.slice('minecraft:'.length)
        : advancementKey;

    return normalized.includes('/') ? normalized.split('/').pop()! : normalized;
}

async function seedworldData(worldName: string, worldId: string, directoryName: string) {
    db.prepare('INSERT INTO worlds (id, name) VALUES (?, ?)').run(worldId, worldName);

    const advancementsPath = path.join(ARCHIVE_PATH, directoryName, 'advancements');
    const advancementFiles = readdirSync(advancementsPath);

    const uuids = [...new Set(advancementFiles.map((f) => f.replace('.json', '')))];
    const existingPlayers = db.prepare('SELECT * FROM players').all() as Player[];

    const upsertPlayer = db.prepare(`
        INSERT INTO players (uuid, name)
        VALUES (?, ?)
    `);

    for (const uuid of uuids) {
        if (!existingPlayers.some(p => p.uuid.includes(uuid))) {
            const name = await getPlayerWithPlayerDB(uuid);
            const res = upsertPlayer.run(uuid, name ?? uuid);
            existingPlayers.push({
                id: res.lastInsertRowid as number,
                uuid: uuid,
                name: name ?? ""
            });
        }
    }

    const existingAdvancements = db.prepare('SELECT id, name, category_id FROM advancements').all() as Advancement[];
    const existingCategories = db.prepare('SELECT id, name FROM advancement_category').all() as Advancement_category[];

    const categoryIdByName = new Map(existingCategories.map((c) => [c.name, c.id]));
    const advancementByName = new Map(existingAdvancements.map((a) => [a.name, a]));

    const insertCategory = db.prepare(`
        INSERT INTO advancement_category (name)
        VALUES (?)
    `);

    const insertAdvancement = db.prepare(`
        INSERT INTO advancements (name, category_id)
        VALUES (?, ?)
    `)

    const updateAdvancementCategory = db.prepare(`
        UPDATE advancements
        SET category_id = ?
        WHERE id = ?
    `);

    const insertPlayerAdvancement = db.prepare(`
        INSERT INTO player_advancements (advancement_id, world_id, player_id, date_achieved)
        VALUES (?, ?, ?, ?)
    `);

    db.transaction(() => {
        for (const file of advancementFiles) {
            const uuid = file.replace('.json', '');

            const advancementData = JSON.parse(readFileSync(path.join(advancementsPath, file), 'utf8'));

            for (const [key, advancement] of Object.entries(advancementData)) {
                if (!key.startsWith('minecraft:')) continue;

                const categoryName = getAdvancementCategoryName(key);
                let categoryId = categoryIdByName.get(categoryName);
                if (!categoryId) {
                    const categoryInsert = insertCategory.run(categoryName);
                    categoryId = categoryInsert.lastInsertRowid as number;
                    categoryIdByName.set(categoryName, categoryId);
                }

                const advancementName = normalizeAdvancementName(key);


                let existingAdvancement = advancementByName.get(key);
                if (!existingAdvancement) {
                    const res = insertAdvancement.run(advancementName, categoryId);
                    existingAdvancement = {
                        id: res.lastInsertRowid as number,
                        name: advancementName,
                        category_id: categoryId
                    };
                    advancementByName.set(advancementName, existingAdvancement);
                } else if (!existingAdvancement.category_id) {
                    updateAdvancementCategory.run(categoryId, existingAdvancement.id);
                    existingAdvancement.category_id = categoryId;
                }

                // @ts-ignore
                const isDone = advancement.done;
                // @ts-ignore
                const criteriaValues = Object.values(advancement.criteria ?? {}).sort((a, b) => new Date(a) - new Date(b));
                const lastCriteriaDate = criteriaValues.at(-1) ?? null; // letzter Eintrag aus criteria

                if (isDone && lastCriteriaDate) {
                    const advancementId = existingAdvancement?.id;
                    if (advancementId) {
                        insertPlayerAdvancement.run(advancementId, worldId, existingPlayers.find(p => p.uuid.includes(uuid))?.id, lastCriteriaDate);
                    }
                }
            }
        }
    })();

    const statsPath = path.join(ARCHIVE_PATH, directoryName, 'stats');
    const statsFiles = readdirSync(statsPath);

    const insertStatGroup = db.prepare(`
        INSERT INTO stat_groups (name)
        VALUES (?)
    `)

    const insertStatType = db.prepare(`
        INSERT INTO stat_types (name)
        VALUES (?)
    `)

    const insertStatTypeGroup = db.prepare(`
        INSERT INTO stat_type_groups (stat_type_id, stat_group_id)
        VALUES (?, ?)
    `)

    const insertPlayerStat = db.prepare(`
        INSERT INTO player_stats (world_id, player_id, stat_group_id, stat_type_id, stat_value)
        VALUES (?, ?, ?, ?, ?)
    `);

    const existingStatGroups = db.prepare('SELECT id, name FROM stat_groups').all() as Stat_group[];
    const existingStatTypes = db.prepare('SELECT id, name FROM stat_types').all() as Stat_type[];
    const existingTypeGroups = db.prepare('SELECT stat_type_id, stat_group_id FROM stat_type_groups').all() as Stat_type_group[];

    const statGroupIdByName = new Map(existingStatGroups.map((g) => [g.name, g.id]));
    const statTypeIdByName = new Map(existingStatTypes.map((t) => [t.name, t.id]));
    const statTypeGroupPairs = new Set(
        existingTypeGroups.map((r) => `${r.stat_type_id}:${r.stat_group_id}`)
    );

    db.transaction(() => {
        for (const file of statsFiles) {
            const uuid = file.replace('.json', '');
            const statData = JSON.parse(readFileSync(path.join(statsPath, file), 'utf8')) as {
                stats?: Record<string, Record<string, number>>;
            };

            const groupedStats = statData.stats ?? {};

            for (const [groupName, groupEntries] of Object.entries(groupedStats)) {
                if (!groupName.startsWith('minecraft:')) continue;

                let statGroupId = statGroupIdByName.get(groupName);
                if (!statGroupId) {
                    const res = insertStatGroup.run(groupName);
                    statGroupId = res.lastInsertRowid as number;
                    statGroupIdByName.set(groupName, statGroupId);
                }

                for (const [statTypeName, rawValue] of Object.entries(groupEntries ?? {})) {
                    if (!statTypeName.startsWith('minecraft:')) continue;

                    let statTypeId = statTypeIdByName.get(statTypeName);
                    if (!statTypeId) {
                        const res = insertStatType.run(statTypeName);
                        statTypeId = res.lastInsertRowid as number;
                        statTypeIdByName.set(statTypeName, statTypeId);
                    }

                    // same type can appear in multiple groups -> keep relation table up to date
                    const relKey = `${statTypeId}:${statGroupId}`;
                    if (!statTypeGroupPairs.has(relKey)) {
                        insertStatTypeGroup.run(statTypeId, statGroupId);
                        statTypeGroupPairs.add(relKey);
                    }

                    const playerId = existingPlayers.find((p) => p.uuid.includes(uuid))?.id;
                    if (playerId == null) continue;

                    insertPlayerStat.run(worldId, playerId, statGroupId, statTypeId, rawValue);
                }
            }
        }
    })();
}

export async function initDatabase() {
    db.exec(loadSchemaSql());

    const playerStatsColumns = db.prepare(`PRAGMA table_info(player_stats)`).all() as Array<{ name: string }>;
    const hasStatGroupId = playerStatsColumns.some((column) => column.name === 'stat_group_id');
    if (!hasStatGroupId) {
        db.exec(`ALTER TABLE player_stats
            ADD COLUMN stat_group_id INTEGER`);
    }

    db.exec(`
        UPDATE player_stats
        SET stat_group_id = (SELECT stg.stat_group_id
                             FROM stat_type_groups stg
                             WHERE stg.stat_type_id = player_stats.stat_type_id
            LIMIT 1
            )
        WHERE stat_group_id IS NULL
    `);

    // @ts-ignore
    const existingworlds = db.prepare('SELECT id FROM worlds').all().map(m => m.id.toString());
    const archivedworldFolders = readdirSync(ARCHIVE_PATH);

    for (const world of archivedworldFolders) {
        if (world.includes("uncompressed")) continue;

        const name = world.split("_");

        if (!existingworlds.includes(name[1])) {
            await seedworldData(name[0] + " " + name[1], name[1], world);
        }
    }

    return db;
}