<script lang="ts">
    import {onMount} from "svelte";
    import {writable} from "svelte/store";

    const END = new Date("2025-11-22T10:00:00").getTime();

    function formatCountdown(now: number) {
        const distance = END - now;
        if (distance < 0) return "🎉 NixoCraft 5 geht los!";

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        return `${days}D ${hours}H ${minutes}M ${seconds}S`;
    }

    // Initial sofort berechnen, damit beim ersten Render bereits ein Wert angezeigt wird
    const countdownText = writable<string>(formatCountdown(Date.now()));

    let timer: ReturnType<typeof setInterval> | null = null;

    onMount(() => {
        timer = setInterval(() => {
            countdownText.set(formatCountdown(Date.now()));
            if (Date.now() > END && timer) {
                clearInterval(timer);
                timer = null;
            }
        }, 1000);

        return () => {
            if (timer) clearInterval(timer);
        };
    });
</script>

<div class="font-semibold text-6xl">{$countdownText}</div>