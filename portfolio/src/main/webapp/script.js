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

/** Tells the server to fetch and delete all comments. */
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

/**
 * Creates a map and adds it to the page.
 */
var purpleStyledMap;
var map;
var marker;
function initMap() {
  // Create a new StyledMapType object, passing it an array of desaturated purple
  // styles, and the name to be displayed on the map type control. 
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

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 33.9955566, lng: -118.4768693},
    zoom: 10,
    mapTypeControlOptions: {
     mapTypeIds: ['roadmap', 'satellite', 'terrain', 'styled_map']
    }
  });

  // Create a marker.
  marker = new google.maps.Marker({
    position: {lat: 33.776260, lng: -84.392390},
    icon: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
    map: map,
    title: "Where I'm working remotely"
  });

  // Create an info window
  const infoW = new google.maps.InfoWindow({
    content: '<h3 class="infowindow-title">Lambda Chi</h3>' + 
    'This is a former fraternity house that was kicked off campus two years ago and has become an on-campus private dorm-style residence for female students for the next four years. Rest in Peace Lambda Chi.',
    maxWidth: 200
  });

  // Add info window to marker that shows info window when marker is clicked on.
  marker.addListener('click', () => {
    infoW.open(map, marker);
  });

  // Associate the purple styled map with the MapTypeId and set it to display.
  map.mapTypes.set('styled_map', purpleStyledMap);
  map.setMapTypeId('styled_map');
}

// DOM listener to load map.
google.maps.event.addDomListener(window, 'load', initMap);