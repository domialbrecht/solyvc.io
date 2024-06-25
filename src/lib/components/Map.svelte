<script lang="ts">
	import { env } from '$env/dynamic/private';
	import { onMount } from 'svelte';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import mapboxgl from 'mapbox-gl';

	mapboxgl.accessToken = env.MAPBOX_TOKEN;

	let mapElement: HTMLDivElement;
	let map: mapboxgl.Map;

	onMount(() => {
		map = new mapboxgl.Map({
			container: mapElement,
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [0, 0],
			zoom: 1
		});
	});
</script>

<div id="map" bind:this={mapElement}></div>
