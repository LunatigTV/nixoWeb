<script>
</script>

Temporary disabled due to issues with the chart library. Will be re-enabled in the future.

<!--
<script lang="ts">
    import {onMount} from "svelte";
    import {title} from "#lib/titleStore";
    import {Card, CardContent, CardHeader, CardTitle} from "#lib/components/ui/card/index.js";
    import {ChartContainer, ChartTooltip} from "#lib/components/ui/chart/index.js";
    import {Separator} from "#lib/components/ui/separator/index.js";
    import {Clock, Sword, TrendingUp, PickaxeIcon, BlocksIcon, ArrowRight} from '@lucide/svelte/icons';
    import {PieChart} from "layerchart";
    import {cubicInOut} from "svelte/easing";
    import {getValidAssetPath} from "#lib/mc-utils";
    import {goto} from "#app/navigation";
    import type {Advancement, Player, PlayerAdvancement} from "#lib/server/db/schema";

    async function navigateTo(path: string) {
        await goto(path);
    }

    const TICKS_PER_HOUR = 72000;

    type WorldStat = {
        world: string;
        total: number;
    };

    type ChartEntry = {
        world: string;
        value: number;
        color: string;
    };

    let {data} = $props<{
        data: {
            player: Player,
            playtimeStatsPerWorld: WorldStat[];
            mobkillStatsPerWorld: WorldStat[];
            totalAdvancements: number,
            playerAdvancements: PlayerAdvancement[];
            topMinedBlocks: { key: string; total: number }[];
            topPlacedBlocks: { key: string; total: number }[];
        }
    }>();

    const buildEntries = (stats: WorldStat[], getValue: (entry: WorldStat) => number = (entry) => entry.total): ChartEntry[] => {
        if (!stats) return [];

        return stats.map((entry: WorldStat, index: number) => ({
            world: entry.world,
            value: getValue(entry),
            color: `hsl(${(index / stats.length) * 360} 70% 50%)`,
        }));
    };

    const buildChartConfig = (entries: ChartEntry[]) =>
        Object.fromEntries(
            entries.map((entry: ChartEntry) => [entry.world, {label: entry.world, color: entry.color}])
        );

    const sumValues = (entries: ChartEntry[]) => entries.reduce((sum: number, entry: ChartEntry) => sum + entry.value, 0);

    let playtimeByWorld = $derived.by(() => buildEntries(data.playtimeStatsPerWorld, (entry) => Number((entry.total / TICKS_PER_HOUR).toFixed(2))));
    let mobkillsByWorld = $derived.by(() => buildEntries(data.mobkillsPerWorld));
    let advancementsByWorld = $derived.by(() => buildEntries(data.advancementsPerWorld));

    let playtimeChartConfig = $derived(buildChartConfig(playtimeByWorld));
    let mobKillsChartConfig = $derived(buildChartConfig(mobkillsByWorld));
    let advancementsChartConfig = $derived(buildChartConfig(advancementsByWorld));

    let totalPlaytime = $derived.by(() => sumValues(playtimeByWorld).toFixed(2));
    let totalMobKills = $derived.by(() => sumValues(mobkillsByWorld));

    const formatBlockKey = (key: string) =>
        key.replace("minecraft:", "").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

    onMount(() => {
        title.set("Statistiken");
    });

</script>

<section class="max-w-7xl mx-auto py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
    <Card class="min-h-0 w-full md:col-span-3">
        <CardHeader class="border-b flex items-center gap-4">
            <img src="https://api.mineatar.io/face/{data.player.uuid}/" alt="{data.player.name}"/>
            <CardTitle>{data.player.name}</CardTitle>
        </CardHeader>
    </Card>

    {#each [
        {
            title: "Advancements",
            icon: TrendingUp,
            entries: advancementsByWorld,
            config: advancementsChartConfig,
            total: String(data.totalAdvancements),
            detailPage: "advancements"
        },
        {
            title: "Spielzeit",
            icon: Clock,
            entries: playtimeByWorld,
            config: playtimeChartConfig,
            total: totalPlaytime
        },
        {
            title: "Mob-Kills",
            icon: Sword,
            entries: mobkillsByWorld,
            config: mobKillsChartConfig,
            total: String(totalMobKills)
        }
    ] as card}
        {@const Icon = card.icon}
        <Card class="min-h-0 w-full">
            <CardHeader class="border-b flex items-center gap-4">
                <Icon color="#94c6f3"/>
                <CardTitle>{card.title}</CardTitle>
                <a href="/stats/{data.player.uuid}/advancements" class="ml-auto"
                   onclick={() => navigateTo("/stats/" + data.player.uuid + "/" + card.detailPage)}>
                    <ArrowRight class="hover:stroke-nixo"/>
                </a>
            </CardHeader>

            <CardContent class="flex-1">
                <div class="relative mx-auto aspect-square max-h-62.5">
                    <ChartContainer config={card.config} class="h-full w-full">
                        <PieChart
                                data={card.entries}
                                key="world"
                                value="value"
                                c="color"
                                innerRadius={60}
                                padding={28}
                                props={{ pie: {motion:{ type: 'tween', duration: 750, easing: cubicInOut }}}}
                                legend
                        >
                            {#snippet tooltip()}
                                <ChartTooltip hideLabel/>
                            {/snippet}
                        </PieChart>
                    </ChartContainer>

                    <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div class="text-3xl font-bold text-foreground">{card.total}</div>
                        <div class="text-muted-foreground">Insgesamt</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    {/each}

    {#each [
        {
            title: "Top 5 abgebaute Blöcke",
            icon: PickaxeIcon,
            data: data.topMinedBlocks
        },
        {
            title: "Top 5 platzierte Blöcke",
            icon: BlocksIcon,
            data: data.topPlacedBlocks

        }
    ] as card}
        {@const Icon = card.icon}
        <Card class="min-h-0 w-full">
            <CardHeader class="border-b flex items-center gap-4">
                <Icon color="#94c6f3"/>
                <CardTitle>{card.title}</CardTitle>
            </CardHeader>

            <CardContent>
                <div>
                    {#if card.data.length === 0}
                        <p class="text-muted-foreground">Keine Daten vorhanden.</p>
                    {:else}
                        <ol class="space-y-3">
                            {#each card.data as item, i}
                                <Card>
                                    <div class="flex justify-between px-2">
                                        <div class="flex flex-1 space-x-2">
                                            <span class="font-semibold text-lg">{i + 1}</span>
                                            <Separator orientation="vertical"/>
                                            <img src={getValidAssetPath(item.key)} alt={item.key} class="w-12 h-12"/>
                                            <span>{formatBlockKey(item.key)}</span>
                                        </div>

                                        <span class="font-mono">{new Intl.NumberFormat('de-DE').format(item.total)}</span>
                                    </div>
                                </Card>
                            {/each}
                        </ol>
                    {/if}
                </div>
            </CardContent>
        </Card>
    {/each}
</section>
-->