<script lang="ts">
    import LeaderboardCard from "$lib/components/LeaderboardCard.svelte";
    import type {LeaderboardGroup} from "$lib/server/db/stats";
    import type {PageData} from './$types';

    let {data}: { data: PageData } = $props();

    let currentWorldId = $state(data.selectedWorldId);
    let leaderboards: LeaderboardGroup[] = $state(data.leaderboards);
    let loading = $state(false);

    async function selectWorld(worldId: number) {
        currentWorldId = worldId;
        loading = true;
        try {
            const res = await fetch(`/api/stats?worldId=${worldId}`);
            leaderboards = await res.json();
        } catch (err) {
            console.error("Failed to load map stats", err);
        } finally {
            loading = false;
        }
    }
</script>

<section class="max-w-7xl mx-auto p-4 space-y-6">
    <h1>Ranglisten</h1>

    <!-- World Selector Tabs -->
    <div class="flex gap-2 overflow-x-auto pb-2 border-b border-border">
        {#each data.worlds as world (world.id)}
            <button
                    onclick={() => selectWorld(world.id)}
                    class="px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap
                {currentWorldId === world.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'}"
            >
                {world.name}
            </button>
        {/each}
    </div>

    <!-- Reusable Dynamic Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each leaderboards as leaderboard (leaderboard.id)}
            <LeaderboardCard {leaderboard} {loading}/>
        {/each}
    </div>
</section>