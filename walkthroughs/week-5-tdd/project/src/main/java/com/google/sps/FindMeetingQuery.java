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

package com.google.sps;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;

public final class FindMeetingQuery {

  /**
   * Given meeting information, return the times when the meeting could happen that day
   */
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    // throw new UnsupportedOperationException("TODO: Implement this method.");
    // Each event has a name, time range (start time, end time, and duration), collection of attendees
    // Each meeting request has a name, a duration in minutes, a collection of attendees

    // If request duration is longer than a whole day.
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
      return Arrays.asList();
    }

    // If attendees have no other events.
    if (events.isEmpty()) {
      return Arrays.asList(TimeRange.WHOLE_DAY);
    }
    
    // Check status of meeting request attendees to determine which helper methods to call.
    if (request.getAttendees().isEmpty() && request.getOptionalAttendees().isEmpty()) {
      // If there are no mandatory event attendees and no optional event attendees,
      return Arrays.asList(TimeRange.WHOLE_DAY);
    } else if (request.getAttendees().isEmpty() && !request.getOptionalAttendees().isEmpty()) {
      // If there are no mandatory event attendees but there are optional attendees,
      
      // Find times where there are conflicts with optional meeting request attendees.
      // The boolean value true is used as a passed in argument in getBadTimes() to determine 
      // which set of attendees to look at. True means look at optional attendees.
      List<TimeRange> badTimesList = getBadTimes(events, request, true);

      if (badTimesList.isEmpty()) {
        // If no optional meeting request attendees are also other events attendees,
        return Arrays.asList(TimeRange.WHOLE_DAY);
      }

      // Find times where there are no conflicts whatsoever to be returned.
      Collection<TimeRange> goodTimesList = getGoodTimes(badTimesList, request);

      return goodTimesList;

    } else {
      // If there are mandatory event attendees,

      // Find times where there are conflicts with mandatory meeting request attendees.
      // The boolean value true is used as a passed in argument in getBadTimes() to determine 
      // which set of attendees to look at. False means look at mandatory attendees.
      List<TimeRange> badTimesList = getBadTimes(events, request, false);

      if (badTimesList.isEmpty()) {
        // If no mandatory meeting request attendees are also other events attendees,
        return Arrays.asList(TimeRange.WHOLE_DAY);
      }

      // Find times where there are no conflicts whatsoever to be returned.
      Collection<TimeRange> goodTimesList = getGoodTimes(badTimesList, request);
      
      // Find if optional meeting request attendees can attend any of the meeting times that work for the mandatory meeting request attendees.
      Collection<TimeRange> goodTimesListForAll = checkOptionalAttendees(goodTimesList, events, request);
      
      // Return the meeting times that work for the mandatory attendees, and optional attendees if possible.
      return goodTimesListForAll;
    }

  }

  /**
   * Find bad times where there are conflicts with events and thus meeting request cannot transpire in.
   */
  private List<TimeRange> getBadTimes(Collection<Event> events, MeetingRequest request, boolean isOnlyOptional) {
    // Find times where meeting request attendees are attendees at other events.
    List<TimeRange> badTimes = new ArrayList<>();
    
    // Initialize collection of request attendees with mandatory meeting request attendees.
    Collection<String> requestAttendees = request.getAttendees();
    // If there are no mandatory meeting request attendees and instead there are only optional attendees,
    if (isOnlyOptional) {
      // Populate collection of request attendees with optional meeting request attendees.
      requestAttendees = request.getOptionalAttendees();
    } 

    for (Event e: events) {
      // Get set of attendees for events.
      Set<String> eventAttendees = e.getAttendees();
      // Compare event attendees to attendees for meeting request.
      for (String requestAttendee : requestAttendees) {
        // If one of the attendees within the meeting request is in another event,
        if (eventAttendees.contains(requestAttendee)) {
          // Time of event does not work for all attendees. Add to bad times.
          badTimes.add(e.getWhen());
        }
      }
    }

    // If no meeting request attendees are also other events attendees, return an empty badTimes.
    if (badTimes.isEmpty()) {
      return badTimes;
    }

    // Create a new list of bad times for meeting request that combines any overlapping/nested event times
    // into one time block.
    List<TimeRange> badTimesList = new ArrayList<>();

    // Compare sequential times within badTimes to discover if there is an overlap beginning with 
    // the very first badTimes
    TimeRange currentTime = badTimes.get(0);
    TimeRange subsequentTime;

    // Go through the list of bad times to discover times where there are nested/overlapping events.
    for (int i = 1; i < badTimes.size(); i++) {
      subsequentTime = badTimes.get(i);

      // If the two times overlap, create a new TimeRange that combines the two times
      // with the earliest of the start times and the latest of the end times of the two.
      if (currentTime.overlaps(subsequentTime)) {
        int newEndTime = Math.max(currentTime.end(), subsequentTime.end());
        currentTime = TimeRange.fromStartEnd(currentTime.start(), newEndTime, false);
      } 
      else {
        badTimesList.add(currentTime);
        currentTime = subsequentTime;
      }
    }

    // If there was only one time in badTimes, add the one time. If there were more, add the final time that
    // could not be compared to a subsequent time (because there was no subsequent time after it).
    badTimesList.add(currentTime);

    return badTimesList;
  }
  
  /**
   * Find good times where meeting request can transpire in. 
   */
  private Collection<TimeRange> getGoodTimes(List<TimeRange> badTimesList, MeetingRequest request) {
    // Find times where there are no conflicts whatsoever to be returned.
    Collection<TimeRange> goodTimesList = new ArrayList<>();

    // Find the good times between the bad times.
    int start = TimeRange.START_OF_DAY;
    for (TimeRange time : badTimesList) {
      if (time.start() - start >= request.getDuration()) {
        // If there is time for the meeting between any conflicting times, add this to the list of good times.
        goodTimesList.add(TimeRange.fromStartEnd(start, time.start(), false));
      }
      start = time.end();
    }

    // If there is time for the meeting between the last conflicting bad time and the end of the day, add this to the list of good times.
    if (TimeRange.END_OF_DAY - start >= request.getDuration()) {
      goodTimesList.add(TimeRange.fromStartEnd(start, TimeRange.END_OF_DAY, true));
    }

    return goodTimesList;
  }

  /**
   * Find times where optional attendees might have other events scheduled to see if there is a meeting time that 
   * might work for both mandatory and optional attendees. If there are times that work for both, return those.
   * Prioritize good meeting times for mandatory attendees first. 
   */
  private Collection<TimeRange> checkOptionalAttendees(Collection<TimeRange> goodMeetingTimes, Collection<Event> events, MeetingRequest request) {
    // Find times where optional meeting request attendees can attend also.
    List<TimeRange> goodTimesForAll = new ArrayList<>();
    // List of times where there are overlaps between good meeting times and times where optional attendees are attendees at other events.
    List<TimeRange> badOptionalTimes = new ArrayList<>();
    // Get set of optional attendees for meeting request.
    Collection<String> optionalAttendees = request.getOptionalAttendees();
    // Go through the good meeting times that work for the mandatory meeting request attendees to see if they work for the optional attendees, too.
    for (TimeRange goodMeetingTime : goodMeetingTimes) {
      for (Event e: events) {
        // Get set of attendees for events.
        Set<String> eventAttendees = e.getAttendees();
        // Compare event attendees to the optional attendees for the meeting request.
        for (String optionalAttendee: optionalAttendees) {
          // If one of the optional attendees for the meeting request is in another event and the event time overlaps with one of the good meeting times,
          if (eventAttendees.contains(optionalAttendee) && goodMeetingTime.overlaps(e.getWhen())) {
            // Time of event does not work for all attendees.  
            badOptionalTimes.add(e.getWhen());
          }
        }
      }

      // This specific meeting time works for both mandatory and optional attendees.
      if (badOptionalTimes.isEmpty()) {
        goodTimesForAll.add(goodMeetingTime);
      }

      // Reset badOptionalTimes to be an empty list to check the next time in goodMeetingTimes.
      badOptionalTimes = new ArrayList<>();
    }

    // If none of the good meeting times work for optional attendees, return passed in goodMeetingTimes untouched.
    if (goodTimesForAll.isEmpty()) {
      return goodMeetingTimes;
    }

    return goodTimesForAll;
  }

}
