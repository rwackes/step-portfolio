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

import com.google.sps.data.FormSubmissions;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse; 

/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/data")
public class DataServlet extends HttpServlet {
  
  private FormSubmissions messages = new FormSubmissions();
  
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    String messagesJson = convertToJsonUsingGson(messages);
    response.getWriter().println(messagesJson);
  }

  private String convertToJsonUsingGson(FormSubmissions messages) {
    Gson gson = new Gson();
    String json = gson.toJson(messages);
    return json;
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Get the first name input from the form.
    String fname = getParameter(request, "firstname", "");
    // Get the last name input from the form.
    String lname = getParameter(request, "lastname", "");
    //Get the email address input from the form.
    String email = getParameter(request, "emailaddress", "");
    //Get the contact number input from the form.
    String number = getParameter(request, "phonenumber", "");
    //Get the message input from the form.
    String message = getParameter(request, "message", "");
    
    messages.takeSubmission(fname, lname, email, number, message);

    // Respond with redirecting user to Comments page.
    response.sendRedirect("/comments.html");
  }

  /**
   * @return the request parameter, or the default value if the parameter
   *         was not specified by the client
   */
  private String getParameter(HttpServletRequest request, String name, String defaultValue) {
    String value = request.getParameter(name);
    if (value == null) {
      return defaultValue;
    }
    return value;
  }
}