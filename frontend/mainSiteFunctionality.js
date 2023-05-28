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
            const postTitle = document.createElement("h2");
            postTitle.className = "post-title";
            postTitle.textContent = post.title;

            const postAuthor = document.createElement("p");
            postAuthor.className = "post-author";
            postAuthor.textContent = "Author: " + post.author;

            const postTags = document.createElement("p");
            postTags.className = "post-tags";
            postTags.textContent = "Tags: " + post.tags;

            const postCreatedAt = document.createElement("p");
            postCreatedAt.className = "post-created-at";
            const date = new Date(post.created_at);
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            const formattedDate = date.toLocaleDateString(undefined, options);
            postCreatedAt.textContent = "Created at: " + formattedDate;

            const postContent = document.createElement("p");
            postContent.className = "post-content";
            postContent.textContent = post.content;

            postDetailsContainer.appendChild(postTitle);
            postDetailsContainer.appendChild(postAuthor);
            postDetailsContainer.appendChild(postTags);
            postDetailsContainer.appendChild(postCreatedAt);
            postDetailsContainer.appendChild(postContent);

            const mainContent = document.querySelector("main");
            mainContent.innerHTML = "";
            mainContent.appendChild(postDetailsContainer);
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
