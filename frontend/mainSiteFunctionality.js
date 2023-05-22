document.addEventListener("DOMContentLoaded", function () {
    fetch("http://127.0.0.1:8000/blog/posts")
        .then(response => response.json())
        .then(data => {
            const tileContainer = document.getElementById("tileContainer");
            data.forEach(post => {
                const tile = document.createElement("div");
                tile.className = "tile";

                const title = document.createElement("h2");
                title.className = "title";
                title.textContent = post.title;
                tile.appendChild(title);

                const createdAt = document.createElement("p");
                createdAt.className = "created-at";

                const date = new Date(post.created_at);
                const options = {year: 'numeric', month: 'long', day: 'numeric'};
                const formattedDate = date.toLocaleDateString(undefined, options);

                createdAt.textContent = "Created at: " + formattedDate;
                tile.appendChild(createdAt);


                // const tags = document.createElement("p");
                // tags.textContent = "Tags: "+ post.tags;
                // tile.appendChild(tags);

                const image = document.createElement("img");
                image.src = post.image;
                image.alt = "Post Image";
                tile.appendChild(image);

                tileContainer.appendChild(tile);
            });
        })
        .catch(error => {
            console.error("Error while loading data:", error);
        });
});
