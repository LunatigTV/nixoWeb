<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
    import {onMount} from "svelte";
    import {title} from "$lib/titleStore";
    import type {World} from "$lib/model/world";
    import type {Player} from "$lib/model/player";
    import {Button} from "$lib/components/ui/button/index.js";
    import {ArrowDownWideNarrow, Funnel} from '@lucide/svelte/icons';
    import {Input} from "$lib/components/ui/input";

    let {data} = $props<{ data: { allPlayers: Player[] } }>();

    let worlds: any[] = $state([]);
    let players = $derived(data.allPlayers);

    let worldSearch = $state("");
    let playerSearch = $state("");

    const norm = (v?: string) => (v ?? "").toLowerCase().trim();

    let filteredWorlds = $derived(
        worlds.filter((m) => norm(m.title).includes(norm(worldSearch)))
    );

    let filteredPlayers = $derived(
        players.filter((p) =>
            norm(p.name).includes(norm(playerSearch)) ||
            p.uuid.toLowerCase().includes(norm(playerSearch))
        ).sort((a, b) => a.name.localeCompare(b.name))
    );

    onMount(async () => {
        title.set("Statistiken");

        const response = await fetch('/maps.json');
        worlds = await response.json();
    });

</script>

<section class="flex h-[80dvh] max-w-7xl mx-auto flex-col lg:flex-row gap-4 py-4">
    <Card.Root class="min-h-0 flex-1">
        <Card.Header class="border-b">
            <Card.Title>
                Welten
            </Card.Title>

            <Card.Action class="flex gap-x-2 items-center">
                <Input bind:value={worldSearch} type="search" placeholder="Suche..." class="max-w-xs"/>
                <Button variant="outline" size="icon" aria-label="Submit">
                    <ArrowDownWideNarrow/>
                </Button>
                <Button variant="outline" size="icon" aria-label="Submit">
                    <Funnel/>
                </Button>
            </Card.Action>
        </Card.Header>

        <Card.Content class="flex flex-col overflow-y-auto gap-y-3">
            {#each filteredWorlds as world}
                <Card.Root class="h-24 justify-center">
                    <Card.Header>
                        <Card.Title>{world.title}</Card.Title>
                    </Card.Header>
                    <Card.Image src="/assets/{world.imageUrl}"/>
                </Card.Root>
            {/each}
        </Card.Content>


    </Card.Root>

    <Card.Root class="min-h-0 flex-1">
        <Card.Header class="border-b">
            <Card.Title>
                Spieler
            </Card.Title>

            <Card.Action class="flex gap-x-2 items-center">
                <Input bind:value={playerSearch} type="search" placeholder="Suche..." class="max-w-xs"/>
                <Button variant="outline" size="icon" aria-label="Submit">
                    <ArrowDownWideNarrow/>
                </Button>
                <Button variant="outline" size="icon" aria-label="Submit">
                    <Funnel/>
                </Button>
            </Card.Action>
        </Card.Header>

        <Card.Content class="flex flex-col overflow-y-auto gap-y-3">
            {#each filteredPlayers as player}
                <Card.Root onclick={() => { window.location.href = `/stats/${player.uuid}`; }} class="cursor-pointer">
                    <Card.Header class="flex space-x-2">
                        <img src="https://api.mineatar.io/face/{player.uuid}/" alt="{player.name}"/>
                        <Card.Title>{player.name}</Card.Title>
                    </Card.Header>
                </Card.Root>
            {/each}
        </Card.Content>

    </Card.Root>


</section>