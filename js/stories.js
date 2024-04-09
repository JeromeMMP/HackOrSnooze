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

  if (currentUser) {
    if (
      currentUser.favorites.some(
        (userFavorites) => userFavorites.storyId === story.storyId
      )
    ) {
      return $(`<li id="${story.storyId}" class="favorites">
       <i class='star fas fa-star fa-s' style='color:#000000'></i>
       <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
    </li>`);
    } else
      return $(`<li id="${story.storyId}">
       <i class='star far fa-star fa-s' style='color:#000000'></i>
       <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
    </li>`);
  } else {
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

// Creating Story in UI
function getStoryData() {
  let title = $("#title").val();
  let author = $("#author").val();
  let url = $("#url").val();
  if (!url.includes("http")) {
    url = "http://" + $("#url").val();
  }
  const storyData = { username: currentUser.username, title, author, url };
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
  console.log(storyData);
  const newStory = await storyList.addStory(currentUser, storyData);
  putStoriesOnPage();
  return newStory;
}

$("#create-story").on("click", createStory);

// adding and removing to favorites

async function addingFavoritesAPI(targetID) {
  const addToFavorites = await axios.post(
    `${BASE_URL}/users/${currentUser.username}/favorites/${targetID}`,
    { token: currentUser.loginToken }
  );

  const storyFromAPI = await axios.get(`${BASE_URL}/stories/${targetID}`);
  console.log(storyFromAPI);
  let story = new Story(storyFromAPI.data.story);
  currentUser.favorites.unshift(story);
  return addToFavorites;
}

async function deleteFavoritesAPI(targetID) {
  try {
    console.log(currentUser.loginToken);
    const deleteFromFavorites = await axios.delete(
      `${BASE_URL}/users/${currentUser.username}/favorites/${targetID}`,
      { token: currentUser.loginToken }
    );
    console.log(deleteFromFavorites);
  } catch (error) {
    console.log("error on:", error.message);
  }

  // const newFavorites = currenteUser.favorites.filter(
  //   (story) => story.storyID !== targetID
  // );
  // version 2
  // currentUser.favorites.splice(0, currentUser.favorites.length);
  // newFavorites.favorites((story) => currentUser.favorites.unshift(story));
  // version 1
  // for (let story of currentUser.favorites) {
  //   if (!newFavorites[story]) {
  //     let index = currentUser.favorites.indexof(story);
  //     currentUser.favorites.splice(index, 1);
  //   }
  // }
  return deleteFromFavorites;
}

function checkingForFavoriteUI(target) {
  if (target.parentElement.className !== "favorites") {
    target.parentElement.className = "favorites";
    target.classList.remove("far");
    target.classList.add("fas");
    addingFavoritesAPI(target.parentElement.id);
  } else {
    target.parentElement.classList.toggle("favorites");
    target.classList.remove("fas");
    target.classList.add("far");
    deleteFavoritesAPI(target.parentElement.id);
  }
}

function addingFavoritesToPage(evt) {
  let target = evt.target;
  checkingForFavoriteUI(target);
}

$("ol").on("click", ".star", addingFavoritesToPage);
