<script lang="ts">
    import {goto} from '$app/navigation';
    import LeaderboardCard from "#lib/components/leaderboard-card.svelte";
    import type {PageData} from './$types';
    import {Button} from "#lib/components/ui/button";
    import {title} from "#lib/titleStore.ts";

    let {data}: { data: PageData } = $props();

    title.set("Statistiken");

    function selectWorld(worldId: number) {
        goto(`?worldId=${worldId}`, {reset: false});
    }
</script>

<section class="max-w-7xl mx-auto p-4 space-y-6">
    <h1>Ranglisten</h1>

    <div class="flex gap-2 overflow-x-auto pb-2 border-b border-border">
        {#each data.worlds as world (world.id)}
            {#if world.id === data.selectedWorldId}
                <Button> {world.name} </Button>
            {:else}
                <Button onclick={() => selectWorld(world.id)} variant="outline">
                    {world.name}
                </Button>
            {/if}
        {/each}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each data.leaderboards as leaderboard (leaderboard.id)}
            <LeaderboardCard {leaderboard}/>
        {/each}
    </div>
</section>