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