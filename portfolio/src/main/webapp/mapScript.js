// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Initialize variables.
var map;
// Create default lat and lng variables for lat, lng points of Google LAX office.
var defaultLat = 33.9955566;
var defaultLng = -118.4768693;
// Create editable marker that displays when user clicks in the map.
var userMarker;

/**
 * Creates a map and adds it to the page.
 */
function initMap() {

  // Call function to create purple styled map.
  createStyledMap();
  
  // Create map.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: defaultLat, lng: defaultLng},
    zoom: 10,
    mapTypeControlOptions: {
     mapTypeIds: ['roadmap', 'satellite', 'terrain', 'styled_map']
    }
  });

  // Allow users to add markers of their own by clicking on map to show a marker a with text box the user can edit. 
  map.addListener('click', (event) => {
    createMarkerForEdit(event.latLng.lat(), event.latLng.lng());
  });

  // Call function to fetch data of markers to add to map.
  fetchMarkers();

  // Associate the purple styled map with the MapTypeId and set it to display.
  map.mapTypes.set('styled_map', purpleStyledMap);
  map.setMapTypeId('styled_map');
}

/**
 * Fetches the data representing locations I have visited from the server and locations other
 * users have visited from the server to add to the map.
 */
function fetchMarkers() {
  // Fetch locations I have visited and create markers. Pass boolean value true to represent
  // these are my locations.
  fetch('/my-markers').then(response => response.json()).then((markers) => {
    markers.forEach((marker) => {
      createMarkers(marker.lat, marker.lng, marker.title, marker.content, true)
    });
  });
  // Fetch locations other users have visited and create markers. Pass boolean value false to
  // represent that these are not my locations.
  fetch('/user-markers').then(response => response.json()).then((markers) => {
    markers.forEach((marker) => {
      createMarkers(marker.lat, marker.lng, marker.title, marker.content, false)
    });
  });
}

/** 
 * Create a marker from the data fetched to be displayed on map with a read-only info window when clicked.
 * @param lat: the latitude point of the location
 * @param lng: the longitude point of the location
 * @param title: the name of the marker and the title for the info window attached to the marker
 * @param content: a description of the location for the info window attached to the marker
 * @param boolean: represents if data is location I have visited (true) or user has visited (false)
 */
function createMarkers(lat, lng, title, content, boolean) {

  // Create a marker with data.
  const marker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    icon: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
    map: map,
    title: title
  }); 
  
  // If marker represents a user inputted location, change icon to pink.
  if (!boolean) {
    marker.setIcon('https://maps.google.com/mapfiles/ms/icons/pink-dot.png')
  }

  // Create a read-only info window (text box that displays title and content description of location).
  const infoWindow = new google.maps.InfoWindow({
    content: '<p class="infowindow-title">' + title + '</p>' + content,
    maxWidth: 400
  });

  // Add info window to marker that shows when marker is clicked on.
  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });
}

/**
 * Creates a marker that shows a textbox the user can edit.
 */
function createMarkerForEdit(lat, lng) {
  // If we are already showing an editable marker, then remove editable marker.
  if (userMarker) {
    userMarker.setMap(null);
  }

  userMarker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    icon: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
    map: map
  });

  const infoWindow = new google.maps.InfoWindow({
    content: buildInfoWindowInput(lat, lng)
  });

  // When user closes editable info window, remove the editable marker.
  google.maps.event.addListener(infoWindow, 'closeclick', () => {
    userMarker.setMap(null);
  });

  // Add info window to marker that shows when marker is clicked on.
  infoWindow.open(map, userMarker);
}

/**
 * Builds and returns HTML elements that show an editable textbok and an add button that adds marker.
 */
function buildInfoWindowInput(lat, lng) {
  const titleLabel = document.createElement('p');
  titleLabel.className = 'title-input';
  titleLabel.innerText = 'Enter Location Name';
  const titleInput = document.createElement('textarea');
  
  const textLabel = document.createElement('p');
  textLabel.className = 'textbox-label';
  textLabel.innerText = 'Enter location description';
  const textBox = document.createElement('textarea');

  const button = document.createElement('button');
  button.className = 'marker-submit-btn'
  button.appendChild(document.createTextNode('Add'));

  button.onclick = () => {
    postMarker(lat, lng, titleInput.value, textBox.value);
    createMarkers(lat, lng, titleInput.value, textBox.value, false);
    userMarker.setMap(null); 
  };

  const containerDiv = document.createElement('div');
  containerDiv.appendChild(titleLabel);
  containerDiv.appendChild(titleInput);
  containerDiv.appendChild(textLabel);
  containerDiv.appendChild(textBox);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(button);

  return containerDiv;
}

/**
 * Sends user marker to backend for saving.
 */
function postMarker(lat, lng, title, content) {
  const params = new URLSearchParams();
  params.append('lat', lat);
  params.append('lng', lng);
  params.append('title', title);
  params.append('content', content);

  fetch('/user-markers', {method: 'POST', body: params});
}

/**
 * Create a new StyledMapType object, passing it an array of desaturated purple
 * styles, and the name to be displayed on the map type control. 
 */
var purpleStyledMap;
function createStyledMap() {
  purpleStyledMap = new google.maps.StyledMapType(
    [
      {
        featureType: 'landscape',
        stylers: [
          {
            "hue": "#84a3f8"
          },
          {
            "saturation": -10
          }
        ]
      },
      {
        featureType: 'poi',
        stylers: [
          {
            "hue": "#84a3f8"
          },
          {
            "saturation": -50
          },
          {
            "lightness": -45
          },
          {
            "visibility": "off"
          }
        ] 
      },
      {
        featureType: 'road',
        stylers: [
          {
            "hue": "#84a3f8"
          },
          {
            "saturation": -30
          }
        ]
      },
      {
        featureType: 'road.local',
        stylers: [
          {
            "lightness": 20
          }
        ]
      },
      {
        featureType: 'transit',
        stylers: [
          {
            "hue": "#84a3f8"
          },
          {
            "saturation": -15
          },
          {
            "visibility": "simplified"
          }
        ]
      },
      {
        featureType: 'transit.line',
        stylers: [
          {
            "saturation": -70
          }
        ]
      },
      {
        featureType: 'water',
        stylers: [
          {
            "hue": "#b7c8f8"
          },
          {
            "saturation": -20
          },
          {
            "lightness": 10
          }
        ]
      }
    ],
    {
      name: 'Purple Map'
    }
  );
}

google.maps.event.addDomListener(window, 'load', initMap());
