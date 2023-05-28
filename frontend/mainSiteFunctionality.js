document.addEventListener("DOMContentLoaded", function () {
    fetch("/blog/posts")
        .then(response => response.json())
        .then(data => {
            const tileContainer = document.getElementById("tileContainer");
            data.forEach((post, index) => {
                const tile = createPostTile(post);
                tileContainer.appendChild(tile);
            });
        })
        .catch(error => {
            console.error("Error while loading data:", error);
        });
});

const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', handleSearch);

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

function handleSearch() {
    const searchQuery = searchInput.value;

    if (searchQuery.trim() === '') {
        return;
    }

    searchPosts(searchQuery)
        .then(posts => {
            displaySearchResults(posts);
        })
        .catch(error => {
            console.error("Error while searching posts:", error);
        });
}

function searchPosts(query) {
    const url = `/blog/search?query=${encodeURIComponent(query)}`;
    return fetch(url)
        .then(response => response.json())
        .then(posts => {
            return posts;
        });
}

function displaySearchResults(posts) {
    const tileContainer = document.getElementById("tileContainer");
    tileContainer.innerHTML = "";

    if (posts.length === 0) {
        const noResultsMessage = document.createElement("p");
        noResultsMessage.textContent = "Brak wyników wyszukiwania.";
        tileContainer.appendChild(noResultsMessage);
    } else {
        posts.forEach(post => {
            const tile = createPostTile(post);
            tileContainer.appendChild(tile);
        });
    }
}

function fetchPostDetails(postId) {
    return fetch(`/blog/posts/${postId}`)
        .then(response => response.json())
        .catch(error => {
            console.error("Error while fetching post details:", error);
        });
}

function displayPostDetails(postId) {
    const postDetailsContainer = document.createElement("section");
    postDetailsContainer.className = "post-details";

    fetchPostDetails(postId)
        .then(post => {
            const postMainSection = document.createElement("section");
            postMainSection.className = "post-main-section";

            const postTitle = document.createElement("h2");
            postTitle.className = "post-title";
            postTitle.textContent = post.title;

            const postAuthorTagsContainer = document.createElement("div");
            postAuthorTagsContainer.className = "post-author-tags-container";

            const postAuthor = document.createElement("p");
            postAuthor.className = "post-author";
            postAuthor.textContent = "Author: " + post.author;

            const postTags = document.createElement("p");
            postTags.className = "post-tags";
            postTags.textContent = "Tagi: " + post.tags;

            postAuthorTagsContainer.appendChild(postTags);
            postAuthorTagsContainer.appendChild(postAuthor);

            const postCreatedAt = document.createElement("p");
            postCreatedAt.className = "post-created-at";
            const date = new Date(post.created_at);
            const options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
            const formattedDate = date.toLocaleDateString(undefined, options);
            postCreatedAt.textContent = "Created at: " + formattedDate;

            const postImage = document.createElement("img");
            postImage.className = "post-image";
            postImage.src = post.image_url;
            postImage.alt = "Post Image";

            const postContent = document.createElement("p");
            postContent.className = "post-content";
            postContent.textContent = post.content;

            postMainSection.appendChild(postTitle);
            postMainSection.appendChild(postCreatedAt);
            postMainSection.appendChild(postAuthorTagsContainer);
            postMainSection.appendChild(postImage);
            postMainSection.appendChild(postContent);

            const mainContent = document.querySelector("main");
            mainContent.innerHTML = "";
            postDetailsContainer.appendChild(postMainSection);
            mainContent.appendChild(postDetailsContainer);

            fetch(`/blog/posts/${postId}/comments`)
                .then(response => response.json())
                .then(comments => {
                    const commentsSection = document.createElement("section");
                    commentsSection.className = "comments-section";

                    const commentsContainer = document.createElement("div");
                    commentsContainer.className = "comments-container";

                    comments.forEach(comment => {
                        const commentElement = document.createElement("div");
                        commentElement.className = "comment";

                        const commentAuthor = document.createElement("p");
                        commentAuthor.className = "comment-author";
                        commentAuthor.textContent = comment.author;

                        const commentDate = document.createElement("p");
                        commentDate.className = "comment-date";
                        const commentDateObj = new Date(comment.created_at);
                        const commentFormattedDate = commentDateObj.toLocaleString();
                        commentDate.textContent = "Date: " + commentFormattedDate;

                        const commentContent = document.createElement("p");
                        commentContent.className = "comment-content";
                        commentContent.textContent = comment.content;

                        commentElement.appendChild(commentAuthor);
                        commentElement.appendChild(commentContent);
                        commentElement.appendChild(commentDate);

                        commentsSection.appendChild(commentElement);
                    });
                    postDetailsContainer.appendChild(commentsSection);
                })
                .catch(error => {
                    console.error("Error while loading comments:", error);
                });
        });
}


const logoElement = document.querySelector(".logo");
logoElement.addEventListener("click", handleLogoClick);

function handleLogoClick(event) {
    displayAllPosts();
}

function displayAllPosts() {
    const tileContainer = document.getElementById("tileContainer");
    tileContainer.innerHTML = "";

    fetch("/blog/posts")
        .then(response => response.json())
        .then(posts => {
            posts.forEach(post => {
                const tile = createPostTile(post);
                tileContainer.appendChild(tile);
            });
        })
        .catch(error => {
            console.error("Error while loading posts:", error);
        });
}

function createPostTile(post) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.setAttribute("data-tile-id", post.id);

    const title = document.createElement("h2");
    title.className = "title";
    title.textContent = post.title.length > 25 ? post.title.substring(0, 25) + "..." : post.title;
    tile.appendChild(title);

    const createdAt = document.createElement("p");
    createdAt.className = "created-at";

    const date = new Date(post.created_at);
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    const formattedDate = date.toLocaleDateString(undefined, options);

    createdAt.textContent = "Created at: " + formattedDate;
    tile.appendChild(createdAt);

    const tags = document.createElement("p");
    tags.className = "tags";
    tags.textContent = "Tags: " + (post.tags.length > 20 ? post.tags.slice(0, 20) + "..." : post.tags);
    tile.appendChild(tags);

    const image = document.createElement("img");
    image.src = post.image;
    image.alt = "Post Image";
    tile.appendChild(image);

    tile.addEventListener("click", function () {
        const tileId = tile.getAttribute("data-tile-id");
        displayPostDetails(tileId);
    });

    return tile;
}
