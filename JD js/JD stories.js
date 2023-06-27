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
//update this to include star for favorites
function getDeleteBtnHTML() {
  return `
    <span class="delete-btn">
      <i class="fas fa-trash-alt"></i>
    </span>
  `;
}

function generateStoryMarkup(story, showDeleteBtn = false) {
  const hostName = story.getHostName();
    // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);
 
  let deleteBtn = '';
  if (showDeleteBtn) {
    deleteBtn = `<span class="delete-btn custom-delete-btn" data-story-id="${story.storyId}">Delete</span>`;
  }
  const starHTML = showStar ? '<span class="star"></span>' : '';
  
  return $(`
      <li id="${story.storyId}">
        ${showStar ? getStarHTML(story, currentUser) : ''}
        <a href="${story.url}" target="_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        ${showDeleteBtn ? deleteBtn : ''}
      </li>
    `);
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story, true);//call the above
    $allStoriesList.append($story);
  }

  $allStoriesList.show();

  // Attach event listeners to the delete buttons
  $('.delete-btn').on('click', function (event) {
    const storyId = $(event.target).data('story-id');
    handleStoryDeletion(storyId);
  });
}

// Function to handle form submission 2B:
async function userSubmitStory(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Get the form inputs
  const title = $("#new-title").val();//this will need to be added to html
  const author = $("#new-author").val();//this will need to be added to html
  const url = $("#new-url").val();//this will need to be added to html

  // Call the addStory method to add the new story
  const newStory = await storyList.addStory(currentUser, { title, author, url });

  // Put the new story on the page
  const $storyElement = generateStoryMarkup(newStory);//calls this function above- is used to generate the HTML markup for the new story
  $allStoriesList.prepend($storyElement);

  // Clear the form inputs
  $("#new-title").val("");
  $("#new-author").val("");
  $("#new-url").val("");
}
// Event listener for form submission
$("#submit-form").on("submit", userSubmitStory);
getAndShowStoriesOnStart();




function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);// call the above
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

/** Make favorite/not-favorite star for story */

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";

  // Add a click event listener to toggle the favorite status
  const starClickHandler = `toggleFavorite(event, '${story.storyId}')`;

  return `
    <span class="star">
      <i class="${starType} fa-star" onclick="${starClickHandler}"></i>
    </span>`;
}

// Function to toggle the favorite status of a story
async function toggleFavorite(event, storyId) {
  event.stopPropagation(); // Prevent the click event from propagating to the story link

  // Find the story in the story list
  const story = storyList.stories.find(story => story.storyId === storyId);

  if (!story) {
    return;
  }

  // Toggle the favorite status
  if (currentUser.isFavorite(story)) {
    await currentUser.removeFav(story);
  } else {
    await currentUser.addFav(story);
  }

  // Update the star icon
  event.target.classList.toggle("fas");
  event.target.classList.toggle("far");
}

// Update the putFavoritesListOnPage function to include the event listener for the stars
function putFavoritesListOnPage() {
  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();

  // Add event listeners to the stars in the favorites list
  $favoritedStories.find(".star").each((index, element) => {
    element.addEventListener("click", (event) => {
      const storyId = event.target.closest("li").id;
      toggleFavorite(event, storyId);
    });
  });
}

// Function to handle story deletion
async function handleStoryDeletion(storyId) {
  // Call the API or perform necessary operations to delete the story

  // Remove the story from the UI
  $('#' + storyId).remove();
}
getAndShowStoriesOnStart();