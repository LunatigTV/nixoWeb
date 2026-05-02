CREATE TABLE IF NOT EXISTS worlds
(
    id        INTEGER PRIMARY KEY,
    name      TEXT    NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 0
    version_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS version
(
    id      INTEGER PRIMARY KEY,
    version TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS players
(
    id   INTEGER PRIMARY KEY,
    uuid TEXT,
    name TEXT
);

CREATE TABLE IF NOT EXISTS stat_groups
(
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stat_type_groups
(
    stat_type_id  INTEGER NOT NULL,
    stat_group_id INTEGER NOT NULL,
    PRIMARY KEY (stat_type_id, stat_group_id)
);


CREATE TABLE IF NOT EXISTS stat_types
(
    id            INTEGER PRIMARY KEY,
    name          TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS player_stats
(
    id            INTEGER PRIMARY KEY,
    world_id      INTEGER NOT NULL,
    player_id     INTEGER NOT NULL,
    stat_group_id INTEGER NOT NULL,
    stat_type_id  INTEGER NOT NULL,
    stat_value    INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS advancement_category
(
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS advancements
(
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS advancement_version
(
    advancement_id INTEGER NOT NULL,
    version_id INTEGER NOT NULL,
    PRIMARY KEY (advancement_id, version_id)
);

CREATE TABLE IF NOT EXISTS player_advancements
(
    id             INTEGER PRIMARY KEY,
    advancement_id INTEGER NOT NULL,
    world_id         INTEGER NOT NULL,
    player_id      INTEGER NOT NULL,
    date_achieved  TEXT    NOT NULL
);

