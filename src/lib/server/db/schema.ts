import {
    mysqlTable,
    int,
    varchar,
    text,
    boolean,
    datetime,
    mysqlEnum,
    primaryKey,
    index,
    unique
} from 'drizzle-orm/mysql-core';
import {relations} from 'drizzle-orm';

// --- Versions & Worlds ---
export const versions = mysqlTable('versions', {
    id: int('id').autoincrement().primaryKey(),
    version: varchar('version', {length: 32}).notNull().unique()
});

export const worlds = mysqlTable('worlds', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', {length: 64}).notNull().unique(),
    description: text('description').notNull(),
    imageUrl: text('image_url'),
    downloadUrl: text('download_url'),
    isActive: boolean('is_active').notNull().default(false),
    versionId: int('version_id').notNull().references(() => versions.id, {onDelete: 'cascade'})
});

// --- Players ---
export const players = mysqlTable('players', {
    id: int('id').autoincrement().primaryKey(),
    uuid: varchar('uuid', {length: 36}).notNull().unique(),
    name: varchar('name', {length: 16}).notNull()
}, (table) => ({
    uuidIdx: index('idx_player_uuid').on(table.uuid)
}));

// --- Stats ---
export const statGroups = mysqlTable('stat_groups', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', {length: 64}).notNull().unique()
});

export const statTypes = mysqlTable('stat_types', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', {length: 128}).notNull(),
    minecraftId: varchar('minecraft_id', {length: 128}).notNull(),
    iconType: mysqlEnum('icon_type', ['item', 'block', 'entity']).default('item').notNull(),
    statGroupId: int('stat_group_id').notNull().references(() => statGroups.id)
}, (table) => ({
    ukStatGroupMcid: unique().on(table.statGroupId, table.minecraftId)
}));

export const playerStats = mysqlTable('player_stats', {
    worldId: int('world_id').notNull().references(() => worlds.id, {onDelete: 'cascade'}),
    playerId: int('player_id').notNull().references(() => players.id, {onDelete: 'cascade'}),
    statTypeId: int('stat_type_id').notNull().references(() => statTypes.id, {onDelete: 'cascade'}),
    statValue: int('stat_value').notNull().default(0)
}, (table) => ({
    pk: primaryKey({columns: [table.worldId, table.playerId, table.statTypeId]}),
    leaderboardIdx: index('idx_leaderboards').on(table.statTypeId, table.worldId, table.statValue)
}));

// --- Advancements ---
export const advancementCategories = mysqlTable('advancement_categories', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', {length: 64}).notNull().unique(),
    backgroundTexture: varchar('background_texture', {length: 255})
});

export const advancementFrames = mysqlTable('advancement_frames', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', {length: 32}).notNull().unique()
});

export const advancements = mysqlTable('advancements', {
    id: int('id').autoincrement().primaryKey(),
    keyName: varchar('key_name', {length: 128}).notNull().unique(),
    iconItem: varchar('icon_item', {length: 128}).notNull(),
    title: varchar('title', {length: 128}).notNull(),
    description: text('description').notNull(),
    frameId: int('frame_id').notNull().references(() => advancementFrames.id),
    categoryId: int('category_id').notNull().references(() => advancementCategories.id),
    parentId: int('parent_id')
});

export const playerAdvancements = mysqlTable('player_advancements', {
    advancementId: int('advancement_id').notNull().references(() => advancements.id, {onDelete: 'cascade'}),
    worldId: int('world_id').notNull().references(() => worlds.id, {onDelete: 'cascade'}),
    playerId: int('player_id').notNull().references(() => players.id, {onDelete: 'cascade'}),
    dateAchieved: datetime('date_achieved')
}, (table) => ({
    pk: primaryKey({columns: [table.advancementId, table.worldId, table.playerId]}),
    playerAdvIdx: index('idx_player_adv').on(table.playerId, table.worldId)
}));