package com.google.sps.data;

/** A form submission/comment. */
public final class FormSubmissions {

  private final long id;
  private final String fname;
  private final String lname;
  private final String emailaddress;
  private final String phonenumber;
  private final long timestamp;
  private final String message;

  public FormSubmissions(long id, String fname, String lname, String emailaddress, String phonenumber, long timestamp, String message) {
      this.id = id;
      this.fname = fname;
      this.lname = lname;
      this.emailaddress = emailaddress;
      this.phonenumber = phonenumber;
      this.timestamp = timestamp;
      this.message = message;
  }
}