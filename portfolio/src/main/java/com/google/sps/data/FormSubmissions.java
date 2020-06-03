package com.google.sps.data;

import java.util.ArrayList;
import java.util.List;

public class FormSubmissions {

  //List of form submissions.
  private final List<String> history = new ArrayList<>();
  
  //Log a user's form submission.
  public void takeSubmission(String fname, String lname, String email, String number, String message) {
      history.add("New form submission by " + fname + " " + lname + ". Email: " + email + ". Phone number: " + number + ". Message reads: " + message);
  }
}