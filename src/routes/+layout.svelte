<script lang="ts">
    import "../app.css";
    import {goto} from "$app/navigation";
    import {title} from "$lib/titleStore";
    import logo from "$lib/assets/logo.webp";
    import {statusJava} from "node-mcstatus";
    import {onMount} from "svelte";

    interface Props {
        children?: import('svelte').Snippet;
    }

    let {children}: Props = $props();

    let playerCount: number = $state(0);
    let isOnline: boolean = $state(false);

    async function navigateTo(path: string) {
        await goto(path);
    }

    async function main_page() {
        await navigateTo("/");
    }

    async function worlds_page() {
        await navigateTo("/worlds");
    }

    async function stats_page() {
        await navigateTo("/stats");
    }

    async function rules_page() {
        await navigateTo("/rules");
    }

    async function faq_page() {
        await navigateTo("/faq");
    }

    onMount(() => {
        statusJava("play.nixocraft.de").then(({online, players}) => {
            isOnline = online;
            playerCount = online ? players!.online : 0;
        });
    });
</script>

<svelte:head>
    <title>{$title}</title>
</svelte:head>

<div class="sticky top-0 bg-gradient-to-r from-primary to-secondary p-0.5 px-0 pt-0 z-50">
    <nav class="flex w-screen items-center max-h-14 p-4 bg-navbar">
        <div class="flex-1 flex justify-start">
            <button onclick={main_page}>
                <img src={logo} alt="Logo" class="h-8 w-auto"/>
            </button>
        </div>

        <div class="flex md:space-x-20 md:pl-10 pl-5 space-x-7">
            <a class="btn-nav" href="/faq" onclick={faq_page}>
                <span>FaQ</span>
            </a>

            <a class="btn-nav" href="/rules" onclick={rules_page}>
                <span>Regeln</span>
            </a>

            <a class="btn-nav" href="/worlds" onclick={worlds_page}>
                <span>Welten</span>
            </a>

            <a class="btn-nav" href="/stats" onclick={stats_page}>
                <span>Statistiken</span>
            </a>
        </div>

        <div class="flex-1 flex justify-end items-center">
            <a class="btn-nav mr-6 flex items-center" target="_blank" rel="noopener noreferrer"
               href="https://status.nixocraft.de/">
                <span class="relative flex size-3 mr-3">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                          class:bg-green={isOnline}
                          class:bg-red={!isOnline}>
                    </span>
                    <span class="relative inline-flex size-3 rounded-full"
                          class:bg-green={isOnline}
                          class:bg-red={!isOnline}>
                    </span>
                </span>

                <span>{playerCount} Spieler online</span>
            </a>

            <a target="_blank" rel="noopener noreferrer" href="https://twitch.tv/fienix_and_izio">
                <svg width="24px" height="24px" viewBox="0 0 256 268" xmlns="http://www.w3.org/2000/svg"
                     class="fill-white hover:fill-[#a970ff] hvr-transition">
                    <path d="M17.4579119,0 L0,46.5559188 L0,232.757287 L63.9826001,232.757287 L63.9826001,267.690956 L98.9144853,267.690956 L133.811571,232.757287 L186.171922,232.757287 L256,162.954193 L256,0 L17.4579119,0 Z M40.7166868,23.2632364 L232.73141,23.2632364 L232.73141,151.29179 L191.992415,192.033461 L128,192.033461 L93.11273,226.918947 L93.11273,192.033461 L40.7166868,192.033461 L40.7166868,23.2632364 Z M104.724985,139.668381 L127.999822,139.668381 L127.999822,69.843872 L104.724985,69.843872 L104.724985,139.668381 Z M168.721862,139.668381 L191.992237,139.668381 L191.992237,69.843872 L168.721862,69.843872 L168.721862,139.668381 Z"
                    ></path>
                </svg>
            </a>
        </div>
    </nav>
</div>

{@render children?.()}

<footer class="bg-background z-50 sticky">
    <div class="bg-black/30">
        <div class="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-6 ">
            <div class="md:flex md:justify-between">
                <div class="mb-6 md:mb-0 flex items-center">
                    <img src={logo} class="h-8 me-3" alt="Logo"/>
                    <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Fienix and Izio</span>
                </div>

                <ul class="flex flex-wrap items-center space-x-3">
                    <li>
                        <a target="_blank" rel="noopener noreferrer" href="https://youtube.com/@faivods">
                            <svg height="35px" width="35px" xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 461.001 461.001" class="fill-white hover:fill-nixo hvr-transition">
                                <g>
                                    <path d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728   c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137   C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607   c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z"/>
                                </g>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a target="_blank" rel="noopener noreferrer" href="https://instagram.com/fienix_and_izio">
                            <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 132.004 132"
                                 class="fill-white hover:fill-nixo hvr-transition">
                                <path d="M66.004 18c-13.036 0-14.672.057-19.792.29-5.11.234-8.598 1.043-11.65 2.23-3.157 1.226-5.835 2.866-8.503 5.535-2.67 2.668-4.31 5.346-5.54 8.502-1.19 3.053-2 6.542-2.23 11.65C18.06 51.327 18 52.964 18 66s.058 14.667.29 19.787c.235 5.11 1.044 8.598 2.23 11.65 1.227 3.157 2.867 5.835 5.536 8.503 2.667 2.67 5.345 4.314 8.5 5.54 3.054 1.187 6.543 1.996 11.652 2.23 5.12.233 6.755.29 19.79.29 13.037 0 14.668-.057 19.788-.29 5.11-.234 8.602-1.043 11.656-2.23 3.156-1.226 5.83-2.87 8.497-5.54 2.67-2.668 4.31-5.346 5.54-8.502 1.18-3.053 1.99-6.542 2.23-11.65.23-5.12.29-6.752.29-19.788 0-13.036-.06-14.672-.29-19.792-.24-5.11-1.05-8.598-2.23-11.65-1.23-3.157-2.87-5.835-5.54-8.503-2.67-2.67-5.34-4.31-8.5-5.535-3.06-1.187-6.55-1.996-11.66-2.23-5.12-.233-6.75-.29-19.79-.29zm-4.306 8.65c1.278-.002 2.704 0 4.306 0 12.816 0 14.335.046 19.396.276 4.68.214 7.22.996 8.912 1.653 2.24.87 3.837 1.91 5.516 3.59 1.68 1.68 2.72 3.28 3.592 5.52.657 1.69 1.44 4.23 1.653 8.91.23 5.06.28 6.58.28 19.39s-.05 14.33-.28 19.39c-.214 4.68-.996 7.22-1.653 8.91-.87 2.24-1.912 3.835-3.592 5.514-1.68 1.68-3.275 2.72-5.516 3.59-1.69.66-4.232 1.44-8.912 1.654-5.06.23-6.58.28-19.396.28-12.817 0-14.336-.05-19.396-.28-4.68-.216-7.22-.998-8.913-1.655-2.24-.87-3.84-1.91-5.52-3.59-1.68-1.68-2.72-3.276-3.592-5.517-.657-1.69-1.44-4.23-1.653-8.91-.23-5.06-.276-6.58-.276-19.398s.046-14.33.276-19.39c.214-4.68.996-7.22 1.653-8.912.87-2.24 1.912-3.84 3.592-5.52 1.68-1.68 3.28-2.72 5.52-3.592 1.692-.66 4.233-1.44 8.913-1.655 4.428-.2 6.144-.26 15.09-.27zm29.928 7.97c-3.18 0-5.76 2.577-5.76 5.758 0 3.18 2.58 5.76 5.76 5.76 3.18 0 5.76-2.58 5.76-5.76 0-3.18-2.58-5.76-5.76-5.76zm-25.622 6.73c-13.613 0-24.65 11.037-24.65 24.65 0 13.613 11.037 24.645 24.65 24.645C79.617 90.645 90.65 79.613 90.65 66S79.616 41.35 66.003 41.35zm0 8.65c8.836 0 16 7.163 16 16 0 8.836-7.164 16-16 16-8.837 0-16-7.164-16-16 0-8.837 7.163-16 16-16z"/>
                            </svg>
                        </a>
                    </li>
                </ul>
            </div>
            <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8"/>
            <div class="sm:flex sm:items-center sm:justify-between">
                <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
                    © {new Date().getFullYear()} NixoCraft
                </span>
                <ul class="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0">
                    <li>
                        <a href="/privacy" class="hover:underline me-4 md:me-6">Datenschützerklärung</a>
                    </li>
                    <li>
                        <a href="/imprint" class="hover:underline me-4 md:me-6">Impressum</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</footer>
