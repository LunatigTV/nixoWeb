import type {AdvancementFrame} from "#lib/server/db/schema";

const blockMap: Record<string, string> = {
    "minecraft:grass_block": "grass_block_side",
};

const blockRenders = import.meta.glob('/static/assets/block_renders/*.png', {eager: true});
const minecraftBlocks = import.meta.glob('/static/assets/minecraft/block/*.png', {eager: true});
const minecraftItems = import.meta.glob('/static/assets/minecraft/item/*.png', {eager: true});

export function getAdvancementFramePath(frameId: number, names: AdvancementFrame[]): string {
    let name = names.find(f => f.id === frameId)?.name ?? "unknown";

    return `/assets/minecraft/gui/sprites/advancements/${name}_frame_obtained.png`;
}

const existingPaths = new Set([
    ...Object.keys(blockRenders).map(p => p.replace('/static', '')),
    ...Object.keys(minecraftBlocks).map(p => p.replace('/static', '')),
    ...Object.keys(minecraftItems).map(p => p.replace('/static', ''))
]);

export function getValidAssetPath(fullId: string): string {
    const id = fullId.replace("minecraft:", "");

    const paths = [
        `/assets/block_renders/${id}.png`,
        `/assets/minecraft/block/${blockMap[fullId] || id}.png`,
        `/assets/minecraft/item/${id}.png`
    ];

    for (const path of paths) {
        if (existingPaths.has(path)) {
            return path;
        }
    }

    return '/assets/minecraft/item/barrier.png';
}