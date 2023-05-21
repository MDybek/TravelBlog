from django.urls import path
from blog_api.views import *

urlpatterns = [
    # Dla niezalogowanego gościa
    path('posts', BlogPostsListView.as_view(), name='post-list'),  # Przeglądanie wpisów blogowych
    path('posts/<int:pk>', BlogPostDetailView.as_view(), name='post-detail'),  # Podgląd szczegółów wpisu
    path('tags', TagListView.as_view(), name='tag-list'),  # Przeglądanie tagów
    path('search', SearchView.as_view(), name='search'),  # Wyszukiwanie

    # Dla zalogowanych użytkowników
    path('register', UserRegistrationView.as_view(), name='register'),  # Rejestracja
    path('login', UserLoginView.as_view(), name='login'),  # Logowanie
    path('logout', UserLogoutView.as_view(), name='logout'),  # Wylogowanie
    path('posts/create', CreateBlogPostView.as_view(), name='create-post'),  # Tworzenie wpisów
    path('posts/<int:pk>/edit', EditBlogPostView.as_view(), name='edit-post'),  # Edycja wpisów
    path('posts/<int:pk>/delete', DeleteBlogPostView.as_view(), name='delete-post'),  # Usuwanie wpisów
    path('posts/<int:pk>/comments', CreateCommentView.as_view(), name='add-comment'),  # Komentowanie wpisów
    path('user/profile', UserProfileView.as_view(), name='user-profile'),  # Zarządzanie profilem
    path('posts/<int:pk>/like', LikePostView.as_view(), name='like-post'),  # Polubienia wpisów
    path('posts/<int:pk>/comments/<int:comment_id>/delete', DeleteCommentView.as_view(), name='delete-comment'),
    # Zarządzanie komentarzami
]
