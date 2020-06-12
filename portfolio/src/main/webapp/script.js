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

/** 
 * Checks if user is logged in. Only logged in users can view previous comments or post new comments.
 */
function authenticate() {
  fetch('/authenticate').then(response => response.json()).then((authenticationStatus) => {
    console.log(authenticationStatus);
    if (authenticationStatus) {
      console.log('User is logged in. Display comments.');
      document.getElementById('comments').style.visibility = 'visible';
    } else {
      console.log('User is not logged in. Comments disabled.');
      window.location.href = 'login.html';
    }
  });
}

/**
 * Function that directs user to Users API login page.
 */
function goToLogin()  {
  fetch('/user-login').then(response => response.text()).then((loginUrl) => {
    console.log(loginUrl);
    console.log('Redirecting to login.');
    window.location.href = loginUrl;
  })
}

/**
 * Function that directs user to Users API logout page.
 */
function goToLogout() {
  fetch('/user-login').then(response => response.text()).then((logoutUrl) => {
    console.log(logoutUrl);
    console.log('Logging user out.');
    window.location.href = logoutUrl;
  });
}

/**
 * Fetches a form submission/comment from the server and adds it to DOM.
 */
function getFormResponse() {
  authenticate();
  const commentsMaxElement = document.getElementById('count').value;
  console.log('Number of comments to be displayed: ' + commentsMaxElement);
  console.log('Fetching responses to form.');
  fetch('/data?count=' + commentsMaxElement).then(response => response.text()).then((comments) => {
    const commentsElement = document.getElementById('comments-container');
    const commentsObj = JSON.parse(comments);
    commentsElement.innerText = '';
    commentsObj.forEach((comment) => {
      commentsElement.appendChild(createCommentElement(comment));
    })
  });
}

/** 
 * Creates an <li> element to be displayed client-side that contains data
 * fetched from a form submission/comment stored in the server passed through getFormResponse().
 * @param server_comment: a FormSubmissions instance stored in server
 * @return commentElement: an <li> element with data of a FormSubmissions instance
 */
function createCommentElement(server_comment) {
  const commentElement = document.createElement('li');
  commentElement.className = 'comment';

  const titleElement = document.createElement('div');
  titleElement.className = 'commentTitle';
  titleElement.innerText = 'Comment Posted By: ' + server_comment.fname + ' ' + server_comment.lname;

  const emailElement = document.createElement('div');
  emailElement.className = 'userEmail';
  emailElement.innerText = server_comment.emailaddress; 
  
  const dateElement = document.createElement('div');
  dateElement.className = 'date';
  const date = new Date(server_comment.timestamp);
  dateElement.innerText = 'Posted on ' + date.toLocaleString();

  const messageElement = document.createElement('div');
  messageElement.className = 'message';
  messageElement.innerText = server_comment.message;

  const deleteButtonElement = document.createElement('button');
  deleteButtonElement.innerText = 'Delete Comment';
  deleteButtonElement.addEventListener('click', () => {
    deleteComment(server_comment);
    commentElement.remove();
  });
  
  commentElement.appendChild(titleElement);
  commentElement.appendChild(emailElement);
  commentElement.appendChild(dateElement);
  commentElement.appendChild(messageElement);
  commentElement.appendChild(deleteButtonElement);
  return commentElement;
}

/** 
 * Tells the server to delete the comment. 
 * @param comment: a FormSubmissions instance stored in the server
 */
function deleteComment(comment) {
  const params = new URLSearchParams();
  params.append('id', comment.id);
  fetch('/delete-comment', {method: 'POST', body:params});
}

/** 
 * Tells the server to fetch and delete all comments. 
 */
function deleteAllComments() {
  fetch('/data').then(response => response.text()).then((comments) => {
    const commentsElement = document.getElementById('comments-container');
    const commentsObj = JSON.parse(comments);
    commentsObj.forEach((comment) => {
      deleteComment(comment);
    })
    commentsElement.innerText = '';
  });
}

// Initialize variables.
var map;
// Create default lat and lng variables for lat, lng points of Google LAX office.
var defaultLat= 33.9955566;
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

  // Call function that fetches data of locations I have visited to add to map.
  fetchMyMarkers();
  // Call function that fetches data of locations users have visited to add to map.
  fetchUserMarkers();

  // Associate the purple styled map with the MapTypeId and set it to display.
  map.mapTypes.set('styled_map', purpleStyledMap);
  map.setMapTypeId('styled_map');
}

/**
 * Fetches the data representing locations I have visited from the server.
 */
function fetchMyMarkers() {
  fetch('/my-markers').then(response => response.json()).then((markers) => {
    markers.forEach((marker) => {
      createMyMarkers(marker.lat, marker.lng, marker.title, marker.content)
    });
  });
}

function fetchUserMarkers() {
  fetch('/user-markers').then(response => response.json()).then((markers) => {
    markers.forEach((marker) => {
      createUserMarkers(marker.lat, marker.lng, marker.title, marker.content)
    });
  });
}

/** 
 * Create a marker from the data fetched to be displayed on map with a read-only info window when clicked.
 * @param lat: the latitude point of the location
 * @param lng: the longitude point of the location
 * @param title: the name of the marker and the title for the info window attached to the marker
 * @param content: a description of the location for the info window attached to the marker
 */
function createMyMarkers(lat, lng, title, content) {
  // Create a marker with data on a place I have visited.
  const marker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    icon: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
    map: map,
    title: title
  });

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
 * Create a marker from user inputted data to be displayed on map with a read-only info window when clicked.
 * @param lat: the latitude point of the location
 * @param lng: the longitude point of the location
 * @param title: the name of the marker and the title for the info window attached to the marker
 * @param content: a description of the location for the info window attached to the marker
 */
function createUserMarkers(lat, lng, title, content) {
  // Create a marker with data on a place a user has visited.
  const marker = new google.maps.Marker({
    position: {lat: lat, lng: lng}, 
    icon: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
    map: map
  });

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
  const titleInput = document.createElement('textarea');
  const textBox = document.createElement('textarea');
  const button = document.createElement('button');
  button.appendChild(document.createTextNode('Submit'));

  button.onclick = () => {
    postMarker(lat, lng, titleInput.value, textBox.value);
    createUserMarkers(lat, lng, titleInput.value, textBox.value);
    userMarker.setMap(null); 
  };

  const containerDiv = document.createElement('div');
  containerDiv.appendChild(titleInput);
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
