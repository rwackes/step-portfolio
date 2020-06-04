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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
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
  
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query("FormSubmissions").addSort("timestamp", SortDirection.DESCENDING);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);
    List<FormSubmissions> comments = new ArrayList<>();
    for (Entity entity: results.asIterable()) {
      long id = entity.getKey().getId();
      String fname = (String) entity.getProperty("fname");
      String lname = (String) entity.getProperty("lname");
      String email = (String) entity.getProperty("emailaddress");
      String number = (String) entity.getProperty("phonenumber");
      long timestamp = (long) entity.getProperty("timestamp");
      String message = (String) entity.getProperty("message");
      FormSubmissions comment = new FormSubmissions(id, fname, lname, email, number, timestamp, message);
      comments.add(comment);
    }
    response.setContentType("application/json");
    String commentsJSON = convertToJsonUsingGson(comments);
    response.getWriter().println(commentsJSON);
  }

  private String convertToJsonUsingGson(List<FormSubmissions> comments) {
    Gson gson = new Gson();
    String json = gson.toJson(comments);
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
    //Get timestamp of when form was submitted.
    long timestamp = System.currentTimeMillis();
    //Get the message input from the form.
    String message = getParameter(request, "message", "");

    Entity formSubmissionEntity = new Entity("FormSubmissions");
    formSubmissionEntity.setProperty("fname", fname);
    formSubmissionEntity.setProperty("lname", lname);
    formSubmissionEntity.setProperty("emailaddress", email);
    formSubmissionEntity.setProperty("phonenumber", number);
    formSubmissionEntity.setProperty("timestamp", timestamp);
    formSubmissionEntity.setProperty("message", message);
    
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(formSubmissionEntity);

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


/** Servlet responsible for deleting form submission/comments.
@WebServlet("/delete-comment")
public class DeleteCommentServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("id"));
    Key formSubmissionEntityKey = KeyFactory.createKey("FormSubmissions", id);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.delete(formSubmissionEntityKey);
  }
}
*/

