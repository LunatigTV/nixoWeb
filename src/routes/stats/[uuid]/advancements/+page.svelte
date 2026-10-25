<script lang="ts">
    import {BlocksIcon, PickaxeIcon} from "@lucide/svelte";
    import {getAdvancementFramePath, getValidAssetPath} from "$lib/mc-utils";
    import {Card, CardContent, CardHeader, CardTitle} from "$lib/components/ui/card";
    import {Separator} from "$lib/components/ui/separator";
    import {onMount} from "svelte";
    import {title} from "$lib/titleStore";
    import {Progress} from "$lib/components/ui/progress/index";
    import type {
        Advancement,
        AdvancementCategory,
        AdvancementFrame,
        Player, PlayerAdvancement,
        VersionAdvancementCount,
        World
    } from "$lib/server/db/schema";
    import * as Select from "$lib/components/ui/select/index.js";
    import {translate} from "$lib/i18n";

    let {data} = $props<{
        data: {
            worlds: World[],
            player: Player,
            playerAdvancements: PlayerAdvancement[];
            versionAdvancementCounts: VersionAdvancementCount[];
            advancementCategories: AdvancementCategory[];
            advancements: Advancement[];
            advancementFrames: AdvancementFrame[];
        }
    }>();


    onMount(() => {
        title.set("Advancements")

    });

    const worlds = [
        {value: "5", label: "NixoCraft 1"},
        {value: "4", label: "NixoCraft 2"},
        {value: "3", label: "NixoCraft 3"},
        {value: "2", label: "NixoCraft 4"},
        {value: "1", label: "NixoCraft 5"}
    ];

    let selectedWorld = $state("1");

    const triggerContent = $derived(
        worlds.find((f) => f.value === selectedWorld)?.label ?? "Server auswählen"
    );


    const categoryCounts = $derived.by(() => {
        const map: Record<string, number> = {};
        if (!selectedWorld) return map;

        const versionId = data.worlds.find((w) => w.id == selectedWorld)?.versionId;
        if (!versionId) return map;

        for (const cat of data.advancementCategories) {
            const match = data.versionAdvancementCounts.find((adv) => {
                return adv.versionId === versionId && adv.categoryId === cat.id;
            });
            map[cat.name.toLowerCase()] = match?.advancementCount ?? 0;
        }

        return map;
    });

    const playerAdvancementsPerCategory = $derived.by(() => {
        const map: Record<string, Record<string, Advancement[]>> = {};
        if (!selectedWorld) return map;

        for (const cat of data.advancementCategories) {
            const advancementsInCategory = data.advancements.filter((adv) => adv.categoryId === cat.id);
            const playerAdvancementsInCategory = data.playerAdvancements.filter((playerAdv) =>
                advancementsInCategory.some((adv) => adv.id === playerAdv.advancementId && playerAdv.worldId == selectedWorld)
            );

            map[cat.name.toLowerCase()] = playerAdvancementsInCategory.map((playerAdv) => {
                const advancement = data.advancements.find((adv) => adv.id === playerAdv.advancementId);
                return advancement!;
            });
        }

        return map;
    });
</script>

<section class="max-w-7xl mx-auto py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
    <Select.Root type="single" name="favoriteFruit" bind:value={selectedWorld}>
        <Select.Trigger class="w-[180px]">
            {triggerContent}
        </Select.Trigger>
        <Select.Content>
            <Select.Group>
                <Select.Label>Fruits</Select.Label>
                {#each worlds as world (world.value)}
                    <Select.Item
                            value={world.value}
                            label={world.label}
                            disabled={world.value === "grapes"}
                    >
                        {world.label}
                    </Select.Item>
                {/each}
            </Select.Group>
        </Select.Content>
    </Select.Root>

    {#each [
        {title: "Story", icon: PickaxeIcon},
        {title: "Nether", icon: BlocksIcon},
        {title: "End", icon: BlocksIcon},
        {title: "Adventure", icon: BlocksIcon},
        {title: "Husbandry", icon: BlocksIcon}
    ] as card}
        {@const Icon = card.icon}
        {@const advancementCount = categoryCounts[card.title.toLowerCase()] ?? 0}
        {@const playerAdvancements = playerAdvancementsPerCategory[card.title.toLowerCase()] ?? 0}
        {@const percentage = advancementCount > 0
            ? Math.round((playerAdvancements.length / advancementCount) * 100)
            : 0}

        <Card class="min-h-0 w-full">
            <CardHeader class="border-b flex items-center gap-4">
                <Icon color="#94c6f3"/>
                <CardTitle>{card.title}</CardTitle>
            </CardHeader>

            <CardContent>
                <div class="flex">
                    <div>{playerAdvancements.length} / {advancementCount}</div>

                    <div class="ml-auto">{ +((playerAdvancements.length / advancementCount) * 100).toFixed(2) }%</div>
                </div>
                <Progress value={percentage} max={100}/>

                {#each playerAdvancements as advancement}

                    <div class="flex items-center gap-2 mt-2">
                        <div class="grid place-items-center w-12 h-12">
                            <img src={getAdvancementFramePath(advancement.frameId, data.advancementFrames)}
                                 alt="Frame"
                                 class="col-start-1 row-start-1 w-12 h-12"/>

                            <img src={getValidAssetPath(advancement.icon)}
                                 alt="Item"
                                 class="col-start-1 row-start-1 w-8 h-8 z-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"/>
                        </div>
                        <span>{translate(advancement.title)}</span>
                    </div>
                {/each}
            </CardContent>
        </Card>
    {/each}
</section>