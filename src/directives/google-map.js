/* global google */ //this is just used to stop the linter caring about google
function googleMap() {
  let currentLocation = {};
  return {
    restrict: 'E',
    template: '<div class="google-map"></div>',
    replace: true,
    scope: {
      center: '=',
      zoom: '=',
      restaurants: '=',
      origin: '='
    },
    link($scope, $element) {

      const map = new google.maps.Map($element[0], {
        zoom: $scope.zoom,
        center: $scope.center
      });
      $scope.$watch('center', () => {
        map.setCenter($scope.center);
      }, true);

      // const image = {
      //   url: '/assets/images/ga-beer-logo.png', // url
      //   scaledSize: new google.maps.Size(25, 25), // scaled size
      //   origin: new google.maps.Point(0,0) // origin
      //   // anchor: new google.maps.Point(0, 0) // anchor
      // };

      const directionsService = new google.maps.DirectionsService();
      const directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true});
      directionsDisplay.setMap(map);

      $scope.$watch('center', () => map.setCenter($scope.center), true);
      $scope.$watch('origin', displayRoute);

      navigator.geolocation.getCurrentPosition(pos => {
        currentLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        displayRoute();
      });

      // DISPLAY ROUTE
      function displayRoute() {
        if(!$scope.origin) return false;

        directionsService.route({
          origin: currentLocation,
          destination: $scope.center,
          travelMode: 'DRIVING'
        }, (response) => {
          directionsDisplay.setDirections(response);
        });
      }

      // directionsDisplay.setPanel(directionsShow);

      $scope.$watch('restaurants', () => {
        var infowindow = new google.maps.InfoWindow();
        var marker, i;
        for (i = 0; i < $scope.restaurants.length; i++) {
          const myLatLng = { lat: parseFloat($scope.restaurants[i].coordinates.latitude), lng: parseFloat($scope.restaurants[i].coordinates.longitude)};
          marker = new google.maps.Marker({
            position: myLatLng,
            map: map
          });
          google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
              infowindow.setContent($scope.restaurants[i].name);
              infowindow.open(map, marker);
            };
          })(marker, i));
        }
      });
    }
  };
}


export default googleMap;
