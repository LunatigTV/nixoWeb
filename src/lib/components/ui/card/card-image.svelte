<script lang="ts">
    import {cn, type WithElementRef} from "#lib/utils.js";
    import type {HTMLAttributes} from "svelte/elements";

    let {
        ref = $bindable(null),
        src,
        class: className,
        children,
        ...restProps
    }: WithElementRef<HTMLAttributes<HTMLDivElement> & { src?: string }> = $props();
</script>

<div
        bind:this={ref}
        data-slot="card-image"
        class={cn("absolute inset-0 object-cover object-center w-full h-full rounded-lg bg-cover bg-center", className)}
        style={src ? `background-image: url('${src}')` : ''}
        {...restProps}
>
    <div class="absolute inset-0 bg-black/50"></div>

    {@render children?.()}
</div>