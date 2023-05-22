document.addEventListener("DOMContentLoaded", function () {
    fetch("http://127.0.0.1:8000/blog/posts")
        .then(response => response.json())
        .then(data => {
            const tileContainer = document.getElementById("tileContainer");
            data.forEach(post => {
                const tile = document.createElement("div");
                tile.className = "tile";
                tile.textContent = post.title;
                tileContainer.appendChild(tile);
            });
        })
        .catch(error => {
            console.error("Błąd pobierania danych:", error);
        });
});