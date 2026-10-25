set foreign_key_checks = 1;

create table if not exists versions
(
    id      int auto_increment primary key,
    version varchar(32) not null unique
);

create table if not exists worlds
(
    id           int auto_increment primary key,
    name         varchar(64) not null unique,
    description  TEXT        not null,
    image_url    TEXT,
    download_url TEXT,
    is_active    BOOLEAN     not null default 0,
    version_id   int         not null,
    foreign key (version_id) references versions (id) on delete cascade
);

create table if not exists players
(
    id           int auto_increment primary key,
    uuid         varchar(36) not null unique, -- Standard UUID String format
    name         varchar(16) not null,
    last_updated timestamp default current_timestamp on update current_timestamp,
    index idx_player_uuid (uuid)
);

-- -----------------------------------------------------
-- Stat System Structures & Textures
-- -----------------------------------------------------

create table if not exists stat_groups
(
    id   int auto_increment primary key,
    name varchar(64) not null unique
);

create table if not exists stat_types
(
    id            int auto_increment primary key,
    name          varchar(128)                       not null,
    minecraft_id  varchar(128)                       not null,
    icon_type     ENUM ( 'item', 'block', 'entity' ) not null default 'item',
    stat_group_id int                                not null,
    unique key uk_stat_group_mcid (stat_group_id, minecraft_id),
    foreign key (stat_group_id) references stat_groups (id)
);

create table if not exists player_stats
(
    world_id     int not null,
    player_id    int not null,
    stat_type_id int not null,
    stat_value   int not null default 0,
    primary key (world_id, player_id, stat_type_id),
    foreign key (world_id) references worlds (id) on delete cascade,
    foreign key (player_id) references players (id) on delete cascade,
    foreign key (stat_type_id) references stat_types (id) on delete cascade,
    index idx_leaderboards (stat_type_id, world_id, stat_value desc)
);

-- -----------------------------------------------------
-- Advancements Structures & Textures
-- -----------------------------------------------------

create table if not exists advancement_categories
(
    id                 int auto_increment primary key,
    name               varchar(64)  not null unique,
    background_texture varchar(255) null
);

create table if not exists advancement_frames
(
    id   int auto_increment primary key,
    name varchar(32) not null unique
);

create table if not exists advancements
(
    id          int auto_increment primary key,
    key_name    varchar(128) not null unique,
    icon_item   varchar(128) not null,
    title       varchar(128) not null,
    description TEXT         not null,
    frame_id    int          not null,
    category_id int          not null,
    parent_id   int          null,
    foreign key (category_id) references advancement_categories (id),
    foreign key (frame_id) references advancement_frames (id),
    foreign key (parent_id) references advancements (id) on delete set null
);

create table if not exists advancement_version
(
    advancement_id int not null,
    version_id     int not null,
    criteria_count int not null default 1,
    primary key (advancement_id, version_id),
    foreign key (advancement_id) references advancements (id) on delete cascade,
    foreign key (version_id) references versions (id) on delete cascade
);

create table if not exists player_advancements
(
    advancement_id int not null,
    world_id       int not null,
    player_id      int not null,
    date_achieved  DATETIME default current_timestamp,
    primary key (advancement_id, world_id, player_id),
    foreign key (advancement_id) references advancements (id) on delete cascade,
    foreign key (world_id) references worlds (id) on delete cascade,
    foreign key (player_id) references players (id) on delete cascade,
    index idx_player_adv (player_id, world_id)
);