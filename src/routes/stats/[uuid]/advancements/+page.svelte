<script lang="ts">
    import type {Player} from "$lib/model/player";
    import {BlocksIcon, PickaxeIcon} from "@lucide/svelte";
    import {getBlockTexturePath} from "$lib/mc-utils";
    import {Card, CardContent, CardHeader, CardTitle} from "$lib/components/ui/card";
    import {Separator} from "$lib/components/ui/separator";
    import {onMount} from "svelte";
    import {title} from "$lib/titleStore";
    import type {AdvancementWithCategory} from "$lib/server/player-advancements";
    import {Progress} from "$lib/components/ui/progress/index.ts";

    type WorldStat = {
        world: string;
        advancement: AdvancementWithCategory[];
        total: number;
    };

    let {data} = $props<{
        data: {
            player: Player,
            advancements: AdvancementWithCategory[];
        }
    }>();

    let player = $derived(data.player);
    let advancementsPerWorld = $derived(data.advancements);

    onMount(() => {
        title.set("Advancements")

    });


    function test() {
        console.log(advancementsPerWorld)
    }


    let value = $state(50);
</script>

<section class="max-w-7xl mx-auto py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

    <button onclick={() => test()}>Test</button>

    {#each [
        {
            title: "Story",
            icon: PickaxeIcon,
            data: data.advancementsPerWorld
        },
        {
            title: "Nether",
            icon: BlocksIcon,
            data: data.topPlacedBlocks

        },
        {
            title: "End",
            icon: BlocksIcon,
            data: data.topPlacedBlocks

        },
        {
            title: "Adventure",
            icon: BlocksIcon,
            data: data.topPlacedBlocks

        },
        {
            title: "Husbandry",
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
                <div class="flex">
                    <div>12 / 15</div>

                    <div class="ml-auto">15%</div>
                </div>
                <Progress {value} max={100}/>
            </CardContent>
        </Card>
    {/each}
</section>