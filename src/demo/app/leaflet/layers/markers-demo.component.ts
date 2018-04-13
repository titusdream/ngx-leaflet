import {Component} from '@angular/core';

import {latLng, Layer, popup, tileLayer} from 'leaflet';

@Component({
	selector: 'leafletMarkersDemo',
	templateUrl: './markers-demo.component.html'
})
export class LeafletMarkersDemoComponent {

	// Open Street Map definitions
	LAYER_OSM = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Open Street Map'
	});

	// Values to bind to Leaflet Directive
	options = {
		layers: [this.LAYER_OSM],
		zoom: 10,
		center: latLng(46.879966, -121.726909)
	};

	markers: Layer[] = [];

	addMarker() {
		// const newMarker = marker(
		// 	[ 46.879966 + 0.1 * (Math.random() - 0.5), -121.726909 + 0.1 * (Math.random() - 0.5) ],
		// 	{
		// 		icon: icon({
		// 			iconSize: [ 25, 41 ],
		// 			iconAnchor: [ 13, 41 ],
		// 			iconUrl: '2273e3d8ad9264b7daa5bdbf8e6b47f8.png',
		// 			shadowUrl: '44a526eed258222515aa21eaffd14a96.png'
		// 		})
		// 	}
		// );
		// const newMarker = marker([ 46.95, -122 ]);
		const newPopup = popup({minWidth: 100}).setLatLng([ 46.879966 + 0.1 * (Math.random() - 0.5), -121.726909 + 0.1 * (Math.random() - 0.5) ]).setContent('Hello Koala');

		// circle([ 46.95, -122 ], { radius: 5000 }),
			// polygon([[ 46.8, -121.85 ], [ 46.92, -121.92 ], [ 46.87, -121.8 ]]),
			// marker([ 46.879966, -121.726909 ])
			//

    // this.markers.push(newMarker);
		this.markers.push(newPopup);
	}

	removeMarker() {
		this.markers.pop();
	}
}
