<script lang="ts">
    import {onMount} from 'svelte';
    import {title} from "$lib/titleStore";

    let maps: any[] = $state([]);

    onMount(async () => {
        title.set("Welten");

        const response = await fetch('/maps.json');
        maps = await response.json();
    });
</script>

<style>
    .hover-fill::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: grey;
        z-index: -1;
        transition: transform .3s ease-in-out;
        transform-origin: left;
        transform: scaleX(0);
    }

    .hover-fill:hover::before {
        transform: scaleX(1);
    }
</style>


<section class="min-h-screen">
    {#each maps as map}
        <div class="container mx-auto md:w-8/12 w-10/12 max-w-full h-80 overflow-hidden relative group rounded-2xl m-8">
            <img class="object-cover object-center w-full h-full rounded-lg group-hover:scale-110 hvr-transition transition-all animate-fade"
                 src="/assets/{map.imageUrl}" alt={map.title}/>
            <div class="absolute inset-0 bg-black/20 hover:bg-black/50 z-10 rounded-lg hvr-transition">
                <div class="absolute z-20 p-4 top-0 left-0 right-0 bottom-0 flex flex-col justify-between items-center text-2xl font-semibold shadow">
                    <span>{map.title}</span>

                    <span>{map.description}</span>

                    <span>{map.version}</span>

                    <a href={map.downloadLink} target="_blank" rel="noopener noreferrer"
                       class="relative inline-block px-4 py-2 border-2 border-white rounded-2xl overflow-hidden hover-fill">
                        <span>Download</span>
                    </a>
                </div>
            </div>
        </div>
    {/each}
</section>