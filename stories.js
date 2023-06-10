'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	if (currentUser === undefined) {
		putStoriesOnPageNoUser();
	} else {
		putStoriesOnPage();
	}
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
	const hostName = story.getHostName();

	return $(`
    <li id="${story.storyId}">
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
	  <hr>
    </li>
  `);
}

// Renders HTML star for favorite functionality

function addFavStar(story) {
	const starDefault = $('<i class="far fa-star"></i>');
	const starFavorite = $('<i class="fas fa-star"></i>');
	const storyId = story.attr('id');
	const isFavorite = currentUser.favorites.find(function (value) {
		return value.storyId === storyId;
	});

	if (isFavorite === undefined) {
		$(story).prepend(starDefault);
		return story;
	} else {
		$(story).prepend(starFavorite);
		return story;
	}
}

// Renders HTML trash can for delete functionality

function addTrashCan(story) {
	const trashCan = $('<i class="far fa-trash-alt"></i>');
	$(story).prepend(trashCan);
	return story;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPageNoUser() {
	$allStoriesList.empty();

	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}
function putStoriesOnPage() {
	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		addFavStar($story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}

// Filters for favorite stories only and generates their HTML
function putFavoritesOnPage() {
	$allStoriesList.empty();

	for (let story of currentUser.favorites) {
		const $story = generateStoryMarkup(story);
		addFavStar($story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}

function putUserStoriesOnPage() {
	$userStoriesList.empty();

	for (let story of currentUser.ownStories) {
		const $story = generateStoryMarkup(story);
		addFavStar($story);
		addTrashCan($story);
		$userStoriesList.append($story);
	}

	$userStoriesList.show();
}

// Generate new user story on form submission
$('#story-submit').on('click', generateUserStory);

async function generateUserStory() {
	console.debug('userAddStory');

	const story = {
		title: $('#story-title').val(),
		author: $('#author-name').val(),
		url: $('#story-url').val(),
	};

	await storyList.addStory(currentUser, story);
	updateUserData();
	await getAndShowStoriesOnStart();
	navSubmitClick();
}

// Favorite story when star is clicked
$body.on('click', '.fa-star', handleFavClick);

async function handleFavClick() {
	const storyId = $(this).parent().attr('id');
	const isFavorite = currentUser.favorites.find(function (value) {
		return value.storyId === storyId;
	});

	if (isFavorite === undefined) {
		await currentUser.addFavorite($(this));
		$(this).toggleClass('fas');
	} else {
		await currentUser.deleteFavorite($(this));
		$(this).toggleClass('fas');
		$(this).toggleClass('far');
	}
}

// Delete user story when trashcan is clicked
$body.on('click', '.fa-trash-alt', handleTrashClick);

async function handleTrashClick() {
	const storyId = $(this).parent().attr('id');
	await storyList.deleteStory(storyId);
	$(this).parent().remove();
}

