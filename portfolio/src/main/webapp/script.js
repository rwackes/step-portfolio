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
 * Fetches a form submission/comment from the server and adds it to DOM
 */
function getFormResponse() {
  console.log('Fetching responses to form.');
  const responsePromise = fetch('/data');
  responsePromise.then(handleResponse);
}

/**
 * Handles response by converting it to text and passing the result to
 * addQuoteToDom().
 */
function handleResponse(response) {
  console.log('Handling the response.');
  const textPromise = response.text();
  textPromise.then(addResponseToDom);
}

/** Adds form submission/comment to the DOM. */
function addResponseToDom(message) {
  console.log('Adding message to dom: ' + message);
  const messageContainer = document.getElementById('message-container');
  var messageObj = JSON.parse(message);
  messageObj.history.forEach((comment) => {
      messageContainer.appendChild(createListElement(comment));
  });
}

/** Creates an <li> element containing form submission/comment. */
function createListElement(comment) {
  const messageContainer = document.createElement('li');
  messageContainer.innerText = comment;
  return messageContainer;
}

