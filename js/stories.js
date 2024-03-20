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

// practicing with api

async function getToken(){ 
  let response = await axios.post('https://hack-or-snooze-v3.herokuapp.com/signup',
    {
      "user": {
        "name": "kasabe",
        "username": "kasabe",
        "password": "password"
      }
    }
  )

  return response.data
}

// const mainUser = { "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imthc2EiLCJpYXQiOjE3MTA4NjI5Mjl9.faESTz2AInR8ARqFiYP0Uj44Q5y83xWRi9mCl9b2EkU","user":{"createdAt":"2024-03-19T15:42:09.972Z","favorites":[],"name":"kahSabe","stories":[],"updatedAt":"2024-03-19T15:42:09.972Z","username":"kasa"}}

// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imthc2EiLCJpYXQiOjE3MTA4NjI5Mjl9.faESTz2AInR8ARqFiYP0Uj44Q5y83xWRi9mCl9b2EkU"

// async function getReq(){
//   const response = await axios.get('https://hack-or-snooze-v3.herokuapp.com/stories');
//   return response.data.stories
// }
