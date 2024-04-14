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
       <i class='star fas fa-star fa-s' style='color:#808080'></i>
       <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <br>
        <small class="story-author">by ${story.author}</small>
        
        <small class="story-user">posted by ${story.username}</small>
    </li>
    <hr>`);
    } else
      return $(`<li id="${story.storyId}">
       <i class='star far fa-star fa-s' style='color:#808080'></i>
       <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <br>
        <small class="story-author">by ${story.author}</small>
       
        <small class="story-user">posted by ${story.username}</small>
    </li>
    <hr>`);
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
      <hr>
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
  const newStory = await storyList.addStory(currentUser, storyData);
  putStoriesOnPage();
  return newStory;
}

$("#create-story").on("click", createStory);

// adding and removing to favorites

async function addingFavoritesAPI(targetID, username, token) {
  try {
    console.log(currentUser.loginToken);
    const deleteFromFavorites = await axios({
      url: `${BASE_URL}/users/${username}/favorites/${targetID}`,
      method: "post",
      params: { token },
    });
    console.log(deleteFromFavorites);
  } catch (error) {
    console.log("error on:", error.message);
  }

  const storyFromAPI = await axios.get(`${BASE_URL}/stories/${targetID}`);

  let story = new Story(storyFromAPI.data.story);
  currentUser.favorites.unshift(story);
  return addToFavorites;
}
function removingFromCurrentFavorites(targetID) {
  const newFavorites = currentUser.favorites.filter(
    (story) => story.storyId !== targetID
  );

  currentUser.favorites.splice(0, currentUser.favorites.length);
  newFavorites.forEach((story) => currentUser.favorites.unshift(story));
}

async function deleteFavoritesAPI(targetID, username, token) {
  try {
    const deleteFromFavorites = await axios({
      url: `${BASE_URL}/users/${username}/favorites/${targetID}`,
      method: "DELETE",
      params: { token },
    });

    removingFromCurrentFavorites(targetID);

    return deleteFromFavorites;
  } catch (error) {
    console.log("error on:", error.message);
  }
}

function checkingForFavoriteUI(target) {
  if (target.parentElement.className !== "favorites") {
    target.parentElement.className = "favorites";
    target.classList.remove("far");
    target.classList.add("fas");
    addingFavoritesAPI(
      target.parentElement.id,
      currentUser.username,
      currentUser.loginToken
    );
  } else {
    target.parentElement.classList.toggle("favorites");
    target.classList.remove("fas");
    target.classList.add("far");
    deleteFavoritesAPI(
      target.parentElement.id,
      currentUser.username,
      currentUser.loginToken
    );
  }
}

function addingFavoritesToPage(evt) {
  let target = evt.target;
  checkingForFavoriteUI(target);
}

$allStoriesList.on("click", ".star", addingFavoritesToPage);
$myStories.on("click", ".star", addingFavoritesToPage);
$favoriteStoriesList.on("click", ".star", addingFavoritesToPage);

// Putting only user related stories on UI (favorites or ownStories)

function putUserRelatedStoriesOnPage(array, favoritesOrOwn) {
  console.debug("putUserRelatedStoriesOnPage");

  favoritesOrOwn.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of array) {
    const $story = generateStoryMarkup(story);

    favoritesOrOwn.append($story);
  }
  if (favoritesOrOwn === $myStories) {
    let myStories = document.querySelectorAll("#my-stories-list > li");

    myStories.forEach(
      (story) =>
        (story.innerHTML =
          '<i class=" delete-btn fas fa-trash-alt"></i>' + story.innerHTML)
    );
  }
}

async function removeStoryFromAPI(targetID) {
  try {
    const deleteStory = await axios({
      url: `${BASE_URL}/stories/${targetID}`,
      method: "DELETE",
      params: { token: currentUser.loginToken },
    });

    //removing from currentUser.ownStories
    const newOwnStories = currentUser.ownStories.filter(
      (story) => story.storyId !== targetID
    );

    currentUser.ownStories.splice(0, currentUser.ownStories.length);
    newOwnStories.forEach((story) => currentUser.ownStories.unshift(story));
    return deleteStory;
  } catch (error) {
    console.log("error message:", error.message);
  }
}

function removeStory(evt) {
  let target = evt.target;

  removeStoryFromAPI(target.parentElement.id);
  removingFromCurrentFavorites(target.parentElement.id);
  target.parentElement.remove();
}

$myStories.on("click", ".delete-btn", removeStory);
