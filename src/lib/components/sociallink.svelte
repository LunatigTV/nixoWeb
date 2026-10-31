<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        href: string;
        label: string;
        children: Snippet;
    }

    let {href, label, children}: Props = $props();
</script>

<a
        {href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        class="text-white hover:text-primary transition-colors duration-200"
>
    {@render children()}
</a>