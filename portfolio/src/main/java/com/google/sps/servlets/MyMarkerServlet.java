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

import com.google.sps.data.Marker;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Scanner;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Handles returning marker data of the locations I have visited as a JSON array*/
@WebServlet("/my-markers")
public class MyMarkerServlet extends HttpServlet {

  //Create a collection of markers.
  private Collection<Marker> markers;

  @Override
  public void init() {
    markers = new ArrayList<>();
    
    // Reference a Scanner that will read each marker's data in CSV file.
    Scanner scanner = new Scanner(getServletContext().getResourceAsStream("/WEB-INF/my-markers-data.csv"));
    while (scanner.hasNextLine()) {
      String line = scanner.nextLine();

      // Data for a new marker is represented as: lat, lng, title, content
      // Split a line by commas to get each corresponding data.
      String[] markerData = line.split(",");
      double lat = Double.parseDouble(markerData[0]);
      double lng = Double.parseDouble(markerData[1]);
      String title = markerData[2];
      String content = markerData[3];

      markers.add(new Marker(lat, lng, title, content));
    }
    scanner.close();
  }

  /**
   * Responds with a JSON array containing marker data.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    String markersJSON = convertToJsonUsingGson(markers);
    response.getWriter().println(markersJSON);
  }

  /** 
   * Converts List of markers to JSON string using GSON library.
   */
  private String convertToJsonUsingGson(Collection<Marker> markers) {
    Gson gson = new Gson();
    String json = gson.toJson(markers);
    return json;
  }
}