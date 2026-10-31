<script>
    import nixo_lupe from '#lib/assets/nixos/nixo-lupe.webp';
    import {Button} from '#lib/components/ui/button';
    import {title} from "#lib/titleStore";
    import {onMount} from "svelte";

    onMount(() => {
        title.set("404");
    });
</script>

<div class="absolute inset-0 -top-24 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-4">
    <picture>
        <source srcset={nixo_lupe} type="image/webp"/>
        <img src={nixo_lupe} alt="Nixo Lupe" class="w-48 md:w-auto max-w-full h-auto"/>
    </picture>

    <div class="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
        <h1 class="text-6xl md:text-9xl font-bold text-primary">404</h1>
        <p class="text-gray-400 font-semibold text-base md:text-2xl">Seite nicht gefunden</p>

        <Button href="/">Zur Startseite</Button>
    </div>
</div>