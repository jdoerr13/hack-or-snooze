"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
  $favoritedStories.hide();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $submitForm.hide();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);


/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  hidePageComponents();
  $allStoriesList.hide();//this was allready defined on line 8 main.js
  $submitForm.show(); //this NEEDs to be created and defined on main as well
  $favoritedStories.hide();
}
$navSubmit.on("click", navSubmitClick);//submit button from the nav bar

function navFavClick(evt) {
  console.debug("navFavClick", evt);
  hidePageComponents();
  putFavoritesListOnPage();
  $submitForm.hide();
}

$body.on("click", "#nav-fav", navFavClick);

$("#nav-all").on("click", function() {
  $favoritedStories.hide();
  $allStoriesList.show();
  $submitForm.hide();
});