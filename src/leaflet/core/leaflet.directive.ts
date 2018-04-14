import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChange
} from '@angular/core';

import {latLng, LatLng, LatLngBounds, map, Map, MapOptions, point, PointExpression} from 'leaflet';

@Directive({
  selector: '[leaflet]'
})
export class LeafletDirective
  implements OnChanges, OnInit {

  readonly DEFAULT_ZOOM = 1;
  readonly DEFAULT_CENTER = latLng(38.907192, -77.036871);
  readonly DEFAULT_FPZ_OPTIONS = {};

  resizeTimer: any;

  // Reference to the primary map object
  map: Map;

  @Input('leafletFitBoundsOptions') fitBoundsOptions = this.DEFAULT_FPZ_OPTIONS;
  @Input('leafletPanOptions') panOptions = this.DEFAULT_FPZ_OPTIONS;
  @Input('leafletZoomOptions') zoomOptions = this.DEFAULT_FPZ_OPTIONS;
  @Input('leafletZoomPanOptions') zoomPanOptions = this.DEFAULT_FPZ_OPTIONS;


  // Default configuration
  @Input('leafletOptions') options: MapOptions = {};

  // Configure callback function for the map
  @Output('leafletMapReady') mapReady = new EventEmitter<Map>();

  // Zoom level for the map
  @Input('leafletZoom') zoom: number;

  // Center the map
  @Input('leafletCenter') center: LatLng;

  // Set fit bounds for map
  @Input('leafletFitBounds') fitBounds: LatLngBounds;

  @Output('leafletMoveEnd') moveEnd = new EventEmitter();

  @Input('leafletViewOffset') viewOffset: PointExpression;

  constructor(private element: ElementRef, private zone: NgZone) {
    // Nothing here
  }

  ngOnInit() {

    // Create the map outside of angular so the various map events don't trigger change detection
    this.zone.runOutsideAngular(() => {

      // Create the map with some reasonable defaults
      this.map = map(this.element.nativeElement, this.options);

    });

    // Only setView if there is a center/zoom
    if (null != this.center && null != this.zoom) {
      this.setView(this.center, this.zoom);
    }

    // Set up all the initial settings
    if (null != this.fitBounds) {
      this.setFitBounds(this.fitBounds);
    }

    this.doResize();

    // Fire map ready event
    this.mapReady.emit(this.map);

  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {

    /*
     * The following code is to address an issue with our (basic) implementation of
     * zooming and panning. From our testing, it seems that a pan operation followed
     * by a zoom operation in the same thread will interfere with eachother. The zoom
     * operation interrupts/cancels the pan, resulting in a final center point that is
     * inaccurate. The solution seems to be to either separate them with a timeout or
      * to collapse them into a setView call.
     */

    // Zooming and Panning
    if (changes['zoom'] && changes['center'] && null != this.zoom && null != this.center) {
      const vo = (changes['viewOffset'] && null != this.viewOffset) ? changes['viewOffset'].currentValue :
          (null != this.viewOffset) ? this.viewOffset : point(0, 0);
      const c = this.calcViewOffset(changes['center'].currentValue, changes['zoom'].currentValue, vo);
      this.setFlyTo(c, changes['zoom'].currentValue);
    }
    // Set the zoom level
    else if (changes['zoom']) {
      this.setZoom(changes['zoom'].currentValue);
    }
    // Set the map center
    else if (changes['center']) {
      this.setCenter(changes['center'].currentValue);
    }

    // Fit bounds
    if (changes['fitBounds']) {
      this.setFitBounds(changes['fitBounds'].currentValue);
    }

  }

  public getMap() {
    return this.map;
  }


  @HostListener('window:resize', [])
  onResize() {
    this.delayResize();
  }

  /**
   * Resize the map to fit it's parent container
   */
  private doResize() {

    // Run this outside of angular so the map events stay outside of angular
    this.zone.runOutsideAngular(() => {

      // Invalidate the map size to trigger it to update itself
      this.map.invalidateSize({});

    });

  }

  /**
   * Manage a delayed resize of the component
   */
  private delayResize() {
    if (null != this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(this.doResize.bind(this), 200);
  }


  /**
   * Set the view (center/zoom) all at once
   * @param center The new center
   * @param zoom The new zoom level
   */
  private setView(center: LatLng, zoom: number) {

    if (this.map && null != center && null != zoom) {
      this.map.setView(center, zoom, this.zoomPanOptions);
    }

  }

  private setFlyTo(center: LatLng, zoom: number) {
    if (this.map && null != center && null != zoom) {
      this.map.flyTo(center, zoom, this.zoomPanOptions);
      this.map.once('moveend', () => { this.moveEnd.emit(); });
    }
  }

  /**
   * Set the map zoom level
   * @param zoom the new zoom level for the map
   */
  private setZoom(zoom: number) {

    if (this.map && null != zoom) {
      this.map.setZoom(zoom, this.zoomOptions);
    }

  }

  /**
   * Set the center of the map
   * @param center the center point
   */
  private setCenter(center: LatLng) {

    if (this.map && null != center) {
      this.map.panTo(center, this.panOptions);
    }

  }

  /**
   * Fit the map to the bounds
   * @param latLngBounds the bounds
   */
  private setFitBounds(latLngBounds: LatLngBounds) {

    if (this.map && null != latLngBounds) {
      this.map.fitBounds(latLngBounds, this.fitBoundsOptions);
    }
  }

  private calcViewOffset(center: LatLng, zoom: number, vo: PointExpression): LatLng {
    return (this.map) ? this.map.unproject(this.map.project(center, zoom).subtract(vo), zoom) : center;
  }
}
