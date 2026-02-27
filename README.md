# CLIPPED
Classroom Linked Integration &amp; Polling Pipeline Engine for Discord

CLIPPED is a bridge between Google Classroom and Discord, designed to keep teams, clubs, and classrooms synchronized without manual posting. It handles two major tasks:

- Announcement Syncing - Detects new Google classroom announcements and posts them to a Discord channel.

- Weekly Scheduling Polls - Automatically sends a Discord poll every Sunday for the next‑next week’s schedule (next week is built in).

## Features
### Google Classroom to Discord Announcement Relay
- Checks for the newest announcement in a specified Classroom.

- Detects whether it has already been posted.

- Sends formatted messages to a Discord webhook.

- Includes teacher name lookup via Classroom UserProfiles.

### Automated Weekly Poll Engine
- Runs every Sunday.

- Generates a 6‑day (Mon–Sat) poll for the following week.

- Uses Discord’s native poll format.

- Prevents duplicate polls using timestamp tracking.

### Reliable State Tracking
- Uses Google Apps Script PropertiesService to store:
  
  - last announcement timestamp
    
  - last poll date
  
  - webhook URLs
 
  - Classroom ID

## Installation

1. Copy the Script
  Paste the provided .gs file into a Google Apps Script project.

2. Add Required Services
  Enable:

  - Google Classroom API>

3. Set Script Properties
Under Project Settings → Script Properties, add:

  - __InformationURL__	- Discord webhook for announcements
  - __SchedulingURL__	- Discord webhook for weekly polls
  - __ClassID	Google__ - Classroom course ID

4. Add Triggers
Create one trigger:
checkAnnouncements
Time‑driven
Every 5–10 minutes

## How It Works
### Announcement Flow
- Fetch all announcements.

- Sort by updateTime.

- Compare newest timestamp to stored timestamp.

- If new then send to Discord
  
- update stored timestamp.

### Weekly Poll Flow
- Check if today is Sunday.

- Check if a poll has already been sent today.

- Generate dates for the next‑next week.

- Build Discord poll JSON.

- Send poll via webhook.

- Store today’s date to prevent duplicates.

## Code Structure
  checkAnnouncements() - main announcement handler
  
  checkClassroomAnnouncements() - fetch + compare logic
  
  sendAnnouncementToDiscord() - webhook sender
  
  checkWeeklyPoll() - Sunday poll scheduler
  
  sendWeeklyPoll() - poll builder + sender
  
  getNextWeekDates() - helper for next week
  
  getNextNextWeekDates() - helper for next‑next week
  
  getUserName() - resolves Classroom user IDs

## Example Output
### Announcement

```
@everyone NOT John Smith: New study guide posted! Due Friday.
```

## Weekly Poll
