// initalises saved constants
const INFORMATION_URL = "InformationURL";
const SCHEDULING_URL = "SchedulingURL";
const CLASS_ID = "ClassID";
const LAST_POST_KEY = "lastPostTime";
const LAST_POLL_KEY = "lastPollTime";

// overarching function
function checkAnnouncements() {
  console.log("Running Script");
  //runs other functions
  checkClassroomAnnouncements();
  checkWeeklyPoll();

  console.log("Script Complete");
}

// grab announcements
function checkClassroomAnnouncements() {
  console.log("Checking Google classroom announcements");
  //gets api needed for checking classrooms
  const props = PropertiesService.getScriptProperties();
  //grab last post time as a "key"
  const lastTime = props.getProperty(LAST_POST_KEY);
  console.log("Last saved announcement timestamp:", lastTime);
  //get classroom course and create announcement variable
  const IdClass = props.getProperty(CLASS_ID);
  const response = Classroom.Courses.Announcements.list(IdClass);
  const announcements = response.announcements || [];

  console.log("Total announcements found:", announcements.length);
  if (announcements.length === 0) {
    console.log("No announcements found. Exiting.");
    return;
  }
  // grab newest anouncment only
  announcements.sort((a, b) => b.updateTime.localeCompare(a.updateTime));

  const newest = announcements[0];
  const postTime = newest.updateTime;

  console.log("Newest announcement timestamp:", postTime);
  console.log("Newest announcement text:", newest.text);

  if (!lastTime || postTime > lastTime) {
    console.log("New announcement detected, sending to Discord...");
    //call sendAnnouncementToDiscord with variable
    sendAnnouncementToDiscord(newest);

    props.setProperty(LAST_POST_KEY, postTime);
    console.log("Saved new timestamp:", postTime);
  } else {
    console.log("No new announcements, nothing to send.");
  }

  console.log("Finished checking classroom announcements");
}
  
//send announcements
function sendAnnouncementToDiscord(post) {
  const props = PropertiesService.getScriptProperties();   // define first
  const teacherName = getUserName(post.creatorUserId);
  const message = `@everyone NOT ${teacherName}: ${post.text}`;

  console.log("Sending announcement to Discord:", message);

  const payload = { content: message };
  const params = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const UrlInfo = props.getProperty(INFORMATION_URL);
    const response = UrlFetchApp.fetch(UrlInfo, params);
    console.log("Discord message:", response.getResponseCode());
  } catch (e) {
    console.error("Error sending to Discord:", e);
  }

  Utilities.sleep(550);
}


// once every sunday poll
function checkWeeklyPoll() {
  console.log("Checking weekly scheduling poll");
  //get api and variables
  const props = PropertiesService.getScriptProperties();
  const lastPoll = props.getProperty(LAST_POLL_KEY);
  console.log("Last poll timestamp:", lastPoll);

  const today = new Date();
  const day = today.getDay(); // Sunday = 0

  if (day !== 0) {
    console.log("Today is not Sunday, no poll");
    return;
  }

  const todayDateString = today.toDateString();
  console.log("Today is Sunday:", todayDateString);

  if (lastPoll === todayDateString) {
    console.log("Poll already marked as sent today, skipping");
    return;
  }

  console.log("Marking poll as sent BEFORE sending (fail-safe).");
  props.setProperty(LAST_POLL_KEY, todayDateString);

  console.log("Sending weekly scheduling poll...");
  sendWeeklyPoll();

  console.log("Finished check weekly poll");
}

//sends weekly poll
function sendWeeklyPoll() {
  const props = PropertiesService.getScriptProperties();
  const webhookUrl = props.getProperty(SCHEDULING_URL);

  // get formatted next-week dates (Mon-Sat)
  const dates = getNextNextWeekDates(); 

  // build poll JSON
  const payload = {
    content: "Hello @everyone ! Please vote for next-next week's schedule:",
    poll: {
      question: {
        text: "When works best for next week?"
      },
      answers: dates.map(date => ({
        poll_media: { text: date }
      })),
      allow_multiselect: false,
      duration: 168 // 7 days
    }
  };

  const params = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(webhookUrl + "?wait=true", params);
    console.log("Poll sent:", response.getContentText());
  } catch (e) {
    console.error("Error sending poll:", e);
  }
}

// logic for dates
function getNextWeekDates() {
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7));

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return days.map((dayName, i) => {
    const d = new Date(nextMonday);
    d.setDate(nextMonday.getDate() + i);

    const monthName = months[d.getMonth()];
    const dayNum = d.getDate();

    return `${dayName} ${monthName} ${dayNum}`;
  });
}

function getNextNextWeekDates() {
  const today = new Date();

  // Find next monday
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7));

  // move forward one more full week
  const nextNextMonday = new Date(nextMonday);
  nextNextMonday.setDate(nextMonday.getDate() + 7);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return days.map((dayName, i) => {
    const d = new Date(nextNextMonday);
    d.setDate(nextNextMonday.getDate() + i);

    const monthName = months[d.getMonth()];
    const dayNum = d.getDate();

    return `${dayName} ${monthName} ${dayNum}`;
  });
}


// user id grabber
function getUserName(userId) {
  try {
    const user = Classroom.UserProfiles.get(userId);
    console.log("user:", user.name.fullName);
    return user.name.fullName;
  } catch (e) {
    console.warn("Failed to get user ID:", userId);
    return "Unknown User";
  }
}
