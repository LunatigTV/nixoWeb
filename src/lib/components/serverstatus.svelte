<script lang="ts">
    import {statusJava} from "node-mcstatus";
    import {onMount} from "svelte";

    let {serverIp = "play.nixocraft.de"}: { serverIp?: string } = $props();

    let playerCount = $state(0);
    let isOnline = $state(false);

    onMount(() => {
        statusJava(serverIp).then(({online, players}) => {
            isOnline = online;
            playerCount = online ? (players?.online ?? 0) : 0;
        });
    });
</script>

<a class="flex items-center font-semibold" target="_blank" rel="noopener noreferrer"
   href="https://status.nixocraft.de/">

    <span class="relative flex size-3 mr-3">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 {isOnline ? 'bg-green-500' : 'bg-red-500'}"></span>
        <span class="relative inline-flex size-3 rounded-full {isOnline ? 'bg-green-500' : 'bg-red-500'}"></span>
    </span>

    <span>{playerCount} Spieler online</span>
</a>