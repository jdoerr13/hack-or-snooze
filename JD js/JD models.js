//contains classes to manage the data of the app and the connection to the API. The name models.js to describe a file containing these kinds of classes that focus on the data and logic about the data. UI stuff shouldn’t go here.

"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {//represents an individual story with the properties below

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    const url = new URL(this.url);
    return url.hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {//THIS CLASS MANAGES A COLLECTION OF "Story" OBJECTS.
  //define a data structure for managing a list of stories which encapsulates the fucntionality related to the list of stories and provides methods to interact with and manipulate the data.
  constructor(stories) {//this function is responsible for initializing this StoryList object. and takes in an optional stories paramenter that represends an array of existing stories. when new StoryList object is created, the constructor sets the 'stories' property to the provided array or even an empty array if no stories are provided.
    this.stories = stories;
  }
//By using class and constructor, can create instances of the StoryList class that have their own seperate list of stories and can perform operations specific to that list.  In this case the class will define methods to add, remove, or retreive.

  /** Generate a new StoryList. It:
   *
   *  1- calls the API
   *  2- builds an array of Story instances
   *  3- makes a single StoryList instance out of that
   *  4- returns the StoryList instance.
   */


  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({//1. why not use await axios.get(with url) instead of:
      url: `${BASE_URL}/stories`,
      method: "GET",
    });
//console.log(response)//we need the data and stories within the response object.
//console.log(response.data.stories)
    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);//4.
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  //SENDING THE NEW STORY DATA TO THE BACKEND API
  async addStory(user, { title, author, url }) {//these attributes are shown on the webpage as requirements inside of object.
    const token = user.loginToken;
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: { title, author, url } },//THE HOSTNAME IS NOT WORKING/POSTING YET- WILL DO getHostName function above!
    });
    //console.log(response) //when you create a new story get 201
    const story = new Story(response.data.story);
    this.stories.unshift(story);
    user.ownStories.unshift(story);

    return story;
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {//these parameters found on  found on body example json
    const response = await axios({
      url: `${BASE_URL}/signup`,//send post request to this url found on website API
      method: "POST",
      data: { user: { username, password, name } },//grouped the data here like the method
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */
//static methods are functions that are defined on the class itself, rather than on its instances(obejcts created from the class)- useful for grouping related functions together within a class
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
//______________
    addFav(story) {//is this story parameter used from above or new parameter?- it represents the story object.
      this.favorites.push(story);//add this new story to end of array of current user
      this._updateFavStatus("add", story);//call update pass in two arguments- add along with the story object
    }
  
    removeFav(story) {
      this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
      this._updateFavStatus("remove", story);
    }
  
    async _updateFavStatus(addOrRem, story) {//using _ means should only be internal use function(don't use outside of User class)
    let method;
      if (addOrRem === "add") {
        method = "POST";
      } else {
        method = "DELETE";
      };
      const token = this.loginToken;//define this token to be able to reuse it.
      try {
        await axios({
          url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
          method: method,//use the variable here instead of indicating. post or .delete after axios.  - this is found in axios library. 
          data: { token },
        });
      } catch (error) {
        console.log("Error updating favorite status:", error);
        // Handle error appropriately (e.g., show an error message to the user)
      }
    }
  
    isFavorite(story) {//checks to see if  a story is present in the favorites array.  - other parts of code can easily determine the favorite status of a story without having to manually iterate over the favorites array each time. it also enhances code readability and reusability to function better with other parts of the application such as the UI. 
      return this.favorites.some(s => s.storyId === story.storyId);
    }
  }


