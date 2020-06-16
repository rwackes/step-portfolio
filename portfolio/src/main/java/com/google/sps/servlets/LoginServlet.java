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

package com.google.sps.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.google.sps.data.FormSubmissions;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse; 


/** Servlet that handles user login and logout links. */
@WebServlet("/user-login")
public class LoginServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException { 
    response.setContentType("text/html");

    // Reference to UserService.
    UserService userService = UserServiceFactory.getUserService();

    // Check user login status.
    if (!userService.isUserLoggedIn()) {
      // User is not logged in so direct user to login URL.
      // Redirect user to comments page after user logs in.
      response.getWriter().println(userService.createLoginURL("/comments.html"));
    } else {
      // User is logged in, so request can proceed.
      // Redirect user to comments page after user logs out (which will direct them to login page).
      response.getWriter().println(userService.createLogoutURL("/comments.html"));
    }
  }
}