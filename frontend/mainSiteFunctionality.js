document.addEventListener("DOMContentLoaded", function () {
    fetch("http://127.0.0.1:8000/blog/posts")
        .then(response => response.json())
        .then(data => {
            const tileContainer = document.getElementById("tileContainer");
            data.forEach((post, index) => {
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
                    handleTileClick(tileId);
                });

                tileContainer.appendChild(tile);
            });
        })
        .catch(error => {
            console.error("Error while loading data:", error);
        });
});

function handleTileClick(tileId) {
    window.open("http://127.0.0.1:8000/blog/posts/" + tileId, "_self");
}