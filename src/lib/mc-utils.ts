const blockMap: Record<string, string> = {
    "minecraft:grass_block": "grass_block_side",
};

export function getBlockTexturePath(fullId: string): string {
    const id = fullId.replace("minecraft:", "");

    const fileName: string = blockMap[fullId] || id;

    return `/assets/minecraft/block/${fileName}.png`;
}