"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function getStoryData() {
  let title = $("#title").val();
  let author = $("#author").val();
  let url = $("#url").val();
  const storyData = { title, author, url };
  console.log(storyData.title);
  return storyData;
}

function checkForValidData(storyData) {
  if (
    [storyData.author, storyData.title, storyData.url].some(
      (value) => value === ""
    )
  ) {
    return alert("Please fill out all the information required");
  } else {
    $("#title").val("");
    $("#author").val("");
    $("#url").val("");
    return;
  }
}

async function createStory(evt) {
  evt.preventDefault();

  let storyData = getStoryData();
  checkForValidData(storyData);
  hidePageComponents();
  $allStoriesList.show();
  console.log(storyData);
  let newStory = await StoryList.constructor.addStory(currentUser, storyData);

  return newStory;
}

$("#create-story").on("click", createStory);
// practicing with api

// async function getToken(){
//   let response = await axios.post('https://hack-or-snooze-v3.herokuapp.com/signup',
//     {
//       "user": {
//         "name": "kasabe",
//         "username": "kasabe",
//         "password": "password"
//       }
//     }
//   )

//   return response.data
// }
