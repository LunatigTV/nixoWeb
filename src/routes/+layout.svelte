<script lang="ts">
    import "../app.css";
    import {title} from "#lib/titleStore";
    import logo from "#lib/assets/logo.webp";
    import nixo_normal from "#lib/assets/nixos/nixo-normal.webp";
    import ServerStatus from "#lib/components/serverstatus.svelte";
    import SocialLink from "#lib/components/sociallink.svelte";
    import {YoutubeIcon, InstagramIcon, TwitchIcon} from "#lib/components/icons";
    import {Separator} from "#lib/components/ui/separator";

    interface Props {
        children?: import('svelte').Snippet;
    }

    let {children}: Props = $props();
    let isOpen = $state(false);

    const navLinks = [
        {name: "Welten", href: "/worlds"},
        {name: "Statistiken", href: "/stats"},
        {name: "Regeln", href: "/rules"},
        {name: "FaQ", href: "/faq"},
    ];

    const currentYear = new Date().getFullYear();
</script>

{#snippet navList(isMobile = false)}
    <div class={isMobile ? "flex flex-col gap-3" : "hidden items-center justify-center gap-8 md:flex lg:gap-10"}>
        {#each navLinks as link}
            <a
                    class="font-semibold uppercase tracking-wider text-gray-200 transition-colors duration-200 hover:text-primary"
                    href={link.href}
                    onclick={() => { if (isMobile) isOpen = false; }}
            >
                {link.name}
            </a>
        {/each}
    </div>
{/snippet}

{#snippet actionItems()}
    <ServerStatus serverIp="play.nixocraft.de"/>
{/snippet}

<svelte:head>
    <title>{$title}</title>
</svelte:head>

<nav class="fixed left-1/2 z-50 flex w-11/12 max-w-7xl -translate-x-1/2 flex-col bg-surface-navbar p-4 rounded-lg top-3 shadow-lg">
    <div class="flex w-full items-center justify-between">
        <a href="/" class="flex items-center gap-2.5 text-lg font-bold text-white transition-opacity hover:opacity-90">
            <img src={nixo_normal} alt="NixoCraft Logo" class="h-8 w-auto object-contain"/>
            <span class="tracking-wide">NIXOCRAFT</span>
        </a>

        {@render navList(false)}

        <div class="hidden items-center justify-end gap-4 md:flex">
            {@render actionItems()}
        </div>

        <button
                type="button"
                onclick={() => (isOpen = !isOpen)}
                aria-label="Toggle navigation"
                class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-200 hover:bg-white/10 focus:outline-none md:hidden"
        >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {#if isOpen}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                {:else}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                {/if}
            </svg>
        </button>
    </div>

    {#if isOpen}
        <div class="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4 md:hidden">
            {@render navList(true)}

            <Separator orientation="horizontal" class="w-full"/>

            <div class="flex items-center justify-between">
                {@render actionItems()}
            </div>
        </div>
    {/if}
</nav>

<main class="min-h-screen pt-24">
    {@render children?.()}
</main>

<footer class="bg-background z-50 sticky">
    <div class="bg-black/30">
        <div class="mx-auto w-full max-w-7xl p-4 py-6 lg:py-6">
            <div class="md:flex md:justify-between">
                <div class="mb-6 md:mb-0 flex items-center">
                    <img src={logo} class="h-8 me-3" alt="Logo"/>
                    <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                        Fienix and Izio
                    </span>
                </div>

                <ul class="flex flex-wrap items-center space-x-4">
                    <li>
                        <SocialLink href="https://twitch.tv/fienix_and_izio" label="Twitch">
                            <TwitchIcon
                                    class="h-5 w-5 fill-current text-gray-300 transition-colors hover:text-[#a970ff]"/>
                        </SocialLink>
                    </li>

                    <li>
                        <SocialLink href="https://youtube.com/@faivods" label="YouTube">
                            <YoutubeIcon class="h-8 w-8 fill-current"/>
                        </SocialLink>
                    </li>
                    <li>
                        <SocialLink href="https://instagram.com/fienix_and_izio" label="Instagram">
                            <InstagramIcon class="h-8 w-8 fill-current"/>
                        </SocialLink>
                    </li>
                </ul>
            </div>

            <Separator orientation="horizontal" class="my-6 w-full sm:mx-auto lg:my-8"/>

            <div class="sm:flex sm:items-center sm:justify-between">
                <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
                    © {currentYear} NixoCraft
                </span>
                <ul class="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0">
                    <li>
                        <a href="/privacy" class="hover:underline me-4 md:me-6">Datenschutzerklärung</a>
                    </li>
                    <li>
                        <a href="/imprint" class="hover:underline me-4 md:me-6">Impressum</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</footer>