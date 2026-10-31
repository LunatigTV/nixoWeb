<script lang="ts">
    import * as Card from "#lib/components/ui/card/index.js";
    import Skeleton from "#lib/components/ui/skeleton/skeleton.svelte";
    import type {LeaderboardGroup} from "#lib/server/db/stats";

    let {
        leaderboard,
        loading = false
    }: {
        leaderboard: LeaderboardGroup;
        loading?: boolean
    } = $props();

    const skeletonRows = Array.from({length: 10});
</script>

<!-- Fixed height container with flex column layout -->
<Card.Root class="h-[675px] flex flex-col shadow-sm border border-border">
    <Card.Header class="border-b py-3 px-4 shrink-0">
        <Card.Title class="text-lg flex items-center gap-2">
            <span>{leaderboard.icon}</span>
            <span>{leaderboard.title}</span>
        </Card.Title>
    </Card.Header>

    <!-- Scrollable content area that fills remaining space -->
    <Card.Content class="flex-1 overflow-y-auto divide-y divide-border px-4 py-0">
        {#if loading}
            <!-- Skeleton Loading State -->
            {#each skeletonRows as _, index (index)}
                <div class="flex items-center justify-between py-2.5">
                    <div class="flex items-center space-x-3">
                        <Skeleton class="w-5 h-4 rounded"/>
                        <Skeleton class="w-8 h-8 rounded-full"/>
                        <Skeleton class="w-28 h-4 rounded"/>
                    </div>
                    <Skeleton class="w-16 h-4 rounded"/>
                </div>
            {/each}
        {:else}
            <!-- Data Present -->
            {#each leaderboard.entries as player, index (player.uuid)}
                <div class="flex items-center justify-between py-2.5 hover:bg-accent/40 px-1 transition-colors rounded">
                    <div class="flex items-center space-x-3 min-w-0">
                        <span class="font-bold w-5 text-sm text-muted-foreground shrink-0">#{index + 1}</span>
                        <img
                                src="https://api.mineatar.io/face/{player.uuid}/"
                                alt="{player.name}"
                                class="w-8 h-8 rounded pixelated shrink-0"
                                loading="lazy"
                        />
                        <span class="font-medium text-sm truncate">{player.name}</span>
                    </div>
                    <span class="font-bold text-sm text-primary shrink-0 ml-2">{player.displayValue}</span>
                </div>
            {:else}
                <!-- Empty State (Keeps same height) -->
                <div class="h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <span class="text-3xl mb-2">📊</span>
                    <p class="text-sm">Keine Statistiken für diese Welt vorhanden.</p>
                </div>
            {/each}
        {/if}
    </Card.Content>
</Card.Root>