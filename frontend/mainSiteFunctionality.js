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

            const currentUserId = localStorage.getItem('user_id');
            if (currentUserId && parseInt(post.author_id) === parseInt(currentUserId)) {
                const editButton = document.createElement("button");
                editButton.className = "post-details-edit-button";
                editButton.textContent = "Edytuj post";
                editButton.addEventListener("click", () => {
                    editPost(postId);
                });

                const deleteButton = document.createElement("button");
                deleteButton.className = "post-details-delete-button";
                deleteButton.textContent = "Usuń post";
                deleteButton.addEventListener("click", () => {
                    deletePost(postId);
                });

                postMainSection.appendChild(editButton);
                postMainSection.appendChild(deleteButton);
            }

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


function deletePost(postId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Brak autoryzacji. Zaloguj się, aby usunąć post.');
        return;
    }

    const confirmation = confirm('Czy na pewno chcesz usunąć ten post?');

    if (!confirmation) {
        return;
    }

    fetch(`/blog/posts/${postId}/delete`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`
        }
    })
        .then(response => {
            if (response.ok) {
                alert('Post został pomyślnie usunięty.');
                location.reload();
            } else {
                response.json().then(data => {
                    if (data.error === 'Post not found') {
                        alert('Nie można usunąć postu, ponieważ nie należy on do użytkownika lub nie istnieje.');
                    } else {
                        throw new Error('Wystąpił błąd podczas usuwania postu.');
                    }
                }).catch(error => {
                    console.error('Błąd podczas przetwarzania odpowiedzi:', error);
                });
            }
        });
}

function editPost(postId) {
    // Pobierz dane postu do edycji
    fetch(`/blog/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            // Tworzenie elementów formularza edycji postu
            const editPostForm = document.createElement('form');
            editPostForm.className = 'edit-post-form';

            const titleLabel = document.createElement('label');
            titleLabel.textContent = 'Tytuł:';
            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.value = post.title;

            const contentLabel = document.createElement('label');
            contentLabel.textContent = 'Treść:';
            const contentTextarea = document.createElement('textarea');
            contentTextarea.value = post.content;

            const tagsLabel = document.createElement('label');
            tagsLabel.textContent = 'Tagi:';
            const tagsInput = document.createElement('input');
            tagsInput.type = 'text';
            tagsInput.value = post.tags;

            const submitButton = document.createElement('button');
            submitButton.textContent = 'Zatwierdź zmiany';

            // Dodaj obsługę zdarzenia submit formularza
            editPostForm.addEventListener('submit', event => {
                event.preventDefault();
                const updatedPost = {
                    title: titleInput.value,
                    content: contentTextarea.value,
                    tags: tagsInput.value
                };
                saveEditedPost(postId, updatedPost);
            });

            editPostForm.appendChild(titleLabel);
            editPostForm.appendChild(titleInput);
            editPostForm.appendChild(contentLabel);
            editPostForm.appendChild(contentTextarea);
            editPostForm.appendChild(tagsLabel);
            editPostForm.appendChild(tagsInput);
            editPostForm.appendChild(submitButton);

            // Wyczyść główny kontener i dodaj formularz edycji postu
            const mainContent = document.querySelector('main');
            mainContent.innerHTML = '';
            mainContent.appendChild(editPostForm);
        })
        .catch(error => {
            console.error('Error while fetching post details:', error);
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

$('#login-button').click(function () {
    $('.login-form').toggleClass('open');
});

$('.login-form').submit(function (event) {
    event.preventDefault();

    if (event.originalEvent.submitter.value === 'SUBMIT') {
        login();
    }
});


$(document).ready(function () {
    var user = localStorage.getItem('user');
    if (user) {
        $('#login-button').text(user).addClass('logged-in');
        $('#profile-image').addClass('profile-image-logged');
        $('.login-form input[type="text"]').remove();
        $('.login-form input[type="password"]').remove();
        $('.login-form input[type="submit"]').remove();

        $('.login-form').append('<button id="new-post-button">Napisz post</button>');
        $('.login-form').append('<button id="edit-account-button">Edytuj dane konta</button>');
        $('.login-form').append('<button id="logout-button">Wyloguj się</button>');

        $('#logout-button').click(function () {
            logout();
        });
        $('#new-post-button').click(function () {
            openNewPostPage();
        });
        $('#edit-account-button').click(function () {
            editAccount();
        });
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    $('#login-button').text('LOG IN').removeClass('logged-in');
    $('#profile-image').removeClass('profile-image-logged');

    $('#new-post-button').remove();
    $('#edit-account-button').remove();
    $('#logout-button').remove();
    $('.login-form').append('<input id="username" type="text" placeholder="Username">');
    $('.login-form').append('<input id="password" type="password" placeholder="Password">');
    $('.login-form').append('<input type="submit" value="SUBMIT">');

    $('.login-form').off('submit');
    $('.login-form input[type="submit"]').click(function (event) {
        event.preventDefault();
        login();
    });

    location.reload();
}


function login() {
    var username = $('#username').val();
    var password = $('#password').val();

    var data = {
        username: username,
        password: password
    };

    // Funkcja logująca
    function performLogin() {
        $.ajax({
            url: '/blog/login',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (response) {
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', response.user);
                    localStorage.setItem('user_id', response.user_id);

                    $('#login-button').text(response.user).addClass('logged-in');
                    $('#profile-image').addClass('profile-image-logged');

                    $('.login-form input[type="text"]').remove();
                    $('.login-form input[type="password"]').remove();
                    $('.login-form input[type="submit"]').remove();

                    $('.login-form').append('<button id="new-post-button">Napisz post</button>');
                    $('.login-form').append('<button id="edit-account-button">Edytuj dane konta</button>');
                    $('.login-form').append('<button id="logout-button">Wyloguj się</button>');

                    $('#logout-button').click(function () {
                        logout();
                    });
                    $('.login-form').removeClass('open');
                    location.reload();
                    alert('Zalogowano pomyślnie!');
                } else {
                    if (response.message === 'Invalid credentials.') {
                        alert('Niepoprawny login lub hasło. Spróbuj ponownie.');
                    } else {
                        alert('Błąd logowania. Spróbuj ponownie.');
                    }
                }
            },
            error: function (xhr, status, error) {
                alert('Błąd logowania. Spróbuj ponownie.');
            }
        });
    }

    performLogin();

    $('#username').val('');
    $('#password').val('');
}


function openNewPostPage() {
    var user = localStorage.getItem('user');
    if (user) {
        $('.login-form').removeClass('open');
        $('body > :not(header)').remove();

        $('body').append('<div class="new-post-page"></div>');
        $('.new-post-page').append('<input id="post-title" type="text" placeholder="Tytuł">');
        $('.new-post-page').append('<input id="post-tags" type="text" placeholder="Tagi">');
        $('.new-post-page').append('<textarea id="post-content" placeholder="Treść"></textarea>');
        $('.new-post-page').append('<input id="post-image" type="text" placeholder="Obrazek">');
        $('.new-post-page').append('<button id="post-submit">Opublikuj</button>');

        $('#post-submit').click(function () {
            createNewPost();
        });
    } else {
        alert('Aby napisać post, musisz być zalogowany.');
    }
}

function createNewPost() {
    var title = $('#post-title').val();
    var tags = $('#post-tags').val();
    var content = $('#post-content').val();
    var image = $('#post-image').val();

    var token = localStorage.getItem('token');

    if (!title || !tags || !content || !image) {
        if (!title) {
            $('#post-title').css('border-color', 'red');
        }
        if (!tags) {
            $('#post-tags').css('border-color', 'red');
        }
        if (!content) {
            $('#post-content').css('border-color', 'red');
        }
        if (!image) {
            $('#post-image').css('border-color', 'red');
        }
        alert('Proszę wypełnić wszystkie pola przed opublikowaniem posta.');
        return;
    }

    var data = {
        title: title,
        tags: tags,
        content: content,
        image: image
    };

    $.ajax({
        url: '/blog/posts/create',
        type: 'POST',
        data: JSON.stringify(data),
        headers: {
            'Authorization': 'Token ' + token,
            'Content-Type': 'application/json'
        },
        success: function (response) {
            alert('Post został opublikowany!');
            location.reload();
        },
        error: function (xhr, status, error) {
            alert('Wystąpił błąd podczas publikowania posta. Spróbuj ponownie.');
        }
    });
}


function editAccount() {
    var user = localStorage.getItem('user');
    if (user) {
        $('.login-form').removeClass('open');
        $('body > :not(header)').remove();

        // Pobierz aktualne dane użytkownika
        $.ajax({
            url: '/blog/user/profile',
            type: 'GET',
            headers: {
                'Authorization': 'Token ' + localStorage.getItem('token')
            },
            success: function (response) {
                var username = response.username;
                var firstName = response.first_name;
                var lastName = response.last_name;
                var email = response.email;

                $('body').append('<div class="edit-account-page"></div>');
                $('.edit-account-page').append('<label for="edit-username">Nazwa użytkownika:</label>');
                $('.edit-account-page').append('<input id="edit-username" type="text" placeholder="Nowa nazwa użytkownika" value="' + username + '">');
                $('.edit-account-page').append('<label for="edit-firstname">Imię:</label>');
                $('.edit-account-page').append('<input id="edit-firstname" type="text" placeholder="Nowe imię" value="' + firstName + '">');
                $('.edit-account-page').append('<label for="edit-lastname">Nazwisko:</label>');
                $('.edit-account-page').append('<input id="edit-lastname" type="text" placeholder="Nowe nazwisko" value="' + lastName + '">');
                $('.edit-account-page').append('<label for="edit-email">Email:</label>');
                $('.edit-account-page').append('<input id="edit-email" type="email" placeholder="Nowy email" value="' + email + '">');
                $('.edit-account-page').append('<button id="edit-submit">Zapisz zmiany</button>');

                $('#edit-submit').click(function () {
                    saveAccountChanges();
                    location.reload();
                });
            },
            error: function (xhr, status, error) {
                alert('Wystąpił błąd podczas pobierania danych użytkownika. Spróbuj ponownie.');
            }
        });
    } else {
        location.reload();
        alert('Aby zmienić dane konta, musisz być zalogowany.');
    }
}

function saveAccountChanges() {
    var newUsername = $('#edit-username').val();
    var newFirstName = $('#edit-firstname').val();
    var newLastName = $('#edit-lastname').val();
    var newEmail = $('#edit-email').val();

    var isInvalid = false;

    if (newUsername === '' || newUsername.length > 200) {
        $('#edit-username').css('border-color', 'red');
        isInvalid = true;
    } else {
        $('#edit-username').css('border-color', '');
    }

    if (newFirstName === '' || newFirstName.length > 200) {
        $('#edit-firstname').css('border-color', 'red');
        isInvalid = true;
    } else {
        $('#edit-firstname').css('border-color', '');
    }

    if (newLastName === '' || newLastName.length > 200) {
        $('#edit-lastname').css('border-color', 'red');
        isInvalid = true;
    } else {
        $('#edit-lastname').css('border-color', '');
    }

    if (newEmail === '' || newEmail.length > 200) {
        $('#edit-email').css('border-color', 'red');
        isInvalid = true;
    } else {
        $('#edit-email').css('border-color', '');
    }

    if (isInvalid) {
        alert('Uzupełnij pola poprawnie!');
        return;
    }

    var data = {
        username: newUsername,
        first_name: newFirstName,
        last_name: newLastName,
        email: newEmail
    };

    $.ajax({
        url: '/blog/user/profile',
        type: 'POST',
        data: data,
        headers: {
            'Authorization': 'Token ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        },
        success: function (response) {
            if (response.message === "User profile updated successfully") {
                localStorage.setItem('user', data.first_name + " " + data.last_name);
                alert('Zmiany zostały zapisane!');
                // location.reload();
            } else {
                // alert('Nieznany komunikat odpowiedzi. Spróbuj ponownie.');
            }
        },
        error: function (xhr, status, error) {
            // alert('Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie.');
        }
    });
}


