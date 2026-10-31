<script lang="ts">
    import {onMount} from 'svelte';
    import {title} from "#lib/titleStore";

    let sections: any[] = $state([]);

    onMount(async () => {
        title.set("Regeln");

        const response = await fetch('/rules.json');
        const jsonData = await response.json();

        sections = jsonData.sections || [];
    });
</script>

<section class="backgroundBox">
    {#each sections as section}
        <div class="text-xl font-bold p-4">{section.title}</div>
        {#each section.rules as rule, ruleIndex}
            <p class="mx-8 my-8 text-lg">
                <span>{ruleIndex + 1}. {rule.content}</span>
            </p>
        {/each}
    {/each}

    <div class="text-lg italic p-6 transition-all animate-fade animate-delay-1000">
        Du kannst die Regeln im Spiel mit /rules accept akzeptieren.
    </div>
</section>