import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { User } from 'firebase';
import {} from 'googlemaps';
import { Observable } from 'rxjs';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapPageComponent implements OnInit {
  
  authUser: Observable<User>;
  
  showMapPill: boolean;
  mapLoaded: boolean;
  map: google.maps.Map;
  center: google.maps.LatLngLiteral;

  time: string = '';
  distance: string = '';

  source: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;

  options: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: true,
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    zoom: 12
  }

  ds: google.maps.DirectionsService;
  dr: google.maps.DirectionsRenderer;

  constructor(
    private loginService: LoginService,
    private ngZone: NgZone) {}

  ngOnInit() {

    this.authUser = this.loginService.getLoggedInUser();

    this.ds = new google.maps.DirectionsService();
    this.dr = new google.maps.DirectionsRenderer({
      map: null,
      suppressMarkers: true
    });

    navigator.geolocation.getCurrentPosition(position => {

      this.source = {
        lat: 37.4220656,
        lng: -122.0840897
      };

      this.destination = {
        lat: 37.342226,
        lng: -122.0256165
      };

      // initialize the map container
      this.map = new google.maps.Map(document.getElementById('map-canvas'), {
        ...this.options,
        center: this.source
      });

      this.map.addListener('tilesloaded', () => {
        this.ngZone.run(() => {
          this.mapLoaded = true;
        });
      });

      // adding a marker
      var markerStart = new google.maps.Marker({
        position: this.source,
        icon: {
          url: './assets/imgs/truck_pin.svg',
          anchor: new google.maps.Point(35,10),
          scaledSize: new google.maps.Size(100, 100)
        },
        map: this.map
      });

      markerStart.addListener("click", (event: any) => {
        this.showMapPill = true;
        this.onCenterMap();
      });

      var destinationMarker = new google.maps.Marker({
        position: this.destination,
        icon: {
          url: './assets/imgs/destination_custom_pin.svg',
          anchor: new google.maps.Point(35,10),
          scaledSize: new google.maps.Size(100, 100)
        },
        map: this.map
      });

      this.map.addListener("click", (event: any) => {
        this.showMapPill = false;
      });

      this.setRoutePolyline();
    });
  }

  setRoutePolyline() {
    let request = {
      origin: this.source,
      destination: this.destination,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.ds.route(request, (response, status) => {
      this.dr.setOptions({
        suppressPolylines: false,
        map: this.map
      });

      if (status == google.maps.DirectionsStatus.OK) {
        this.dr.setDirections(response);

        let distanceInfo = response.routes[0].legs[0];
        this.distance = distanceInfo.distance.text;
        this.time = distanceInfo.duration.text;
      }
    })
  }

  onCenterMap() {
    this.map.panTo(this.source);
  }

  onLogout() {
    this.loginService.logout();
  }
}
