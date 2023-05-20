from django.http import JsonResponse
from django.views import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from .models import *


def login_required_decorator(view_func):
    decorated_view_func = login_required(view_func)
    return decorated_view_func


class BlogPostsListView(View):
    def get(self, request):
        posts = Post.objects.all()
        data = []

        for post in posts:
            post_data = {
                'title': post.title,
                'created_at': post.created_at,
                'tags': [tag.name for tag in post.tags.all()],
                'image': post.image.url if post.image else None
            }
            data.append(post_data)

        return JsonResponse(data, safe=False)


class BlogPostDetailView(View):
    def get(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
            post_data = {
                'title': post.title,
                'tags': post.tags,
                'content': post.content,
                'author': post.author.username,
                'created_at': post.created_at
            }
            return JsonResponse(post_data)
        except Post.DoesNotExist:
            return JsonResponse({'error': 'Post does not exist'}, status=404)


class TagListView(View):
    def get(self, request):
        tag = request.GET.get('tag')

        if tag:
            posts = Post.objects.filter(tags__icontains=tag)

            results = []
            for post in posts:
                post_data = {
                    'title': post.title,
                    'created_at': post.created_at,
                    'author': post.author.username,
                    'image': post.image.url if post.image else None
                }
                results.append(post_data)

            return JsonResponse({'results': results})
        else:
            return JsonResponse({'error': 'Tag parameter is required'}, status=400)


class SearchView(View):
    def get(self, request):
        query = request.GET.get('query')

        if query:
            posts = Post.objects.filter(title__icontains=query)

            results = []
            for post in posts:
                post_data = {
                    'title': post.title,
                    'created_at': post.created_at,
                    'author': post.author.username,
                    'image': post.image.url if post.image else None

                }
                results.append(post_data)

            return JsonResponse({'results': results})
        else:
            return JsonResponse({'error': 'Query parameter is required'}, status=400)


class UserRegistrationView(View):
    def post(self, request):
        raise NotImplementedError("Not implemented yet.")


class UserLoginView(View):
    def post(self, request):
        raise NotImplementedError("Not implemented yet.")


class UserLogoutView(View):
    def post(self, request):
        raise NotImplementedError("Not implemented yet.")


class CreateBlogPostView(View):
    @method_decorator(login_required)
    def post(self, request):
        raise NotImplementedError("Not implemented yet.")


class EditBlogPostView(View):
    @method_decorator(login_required)
    def post(self, request, pk):
        raise NotImplementedError("Not implemented yet.")


class DeleteBlogPostView(View):
    @method_decorator(login_required)
    def post(self, request, pk):
        raise NotImplementedError("Not implemented yet.")


class AddCommentView(View):
    @method_decorator(login_required)
    def post(self, request, pk):
        raise NotImplementedError("Not implemented yet.")


class UserProfileView(View):
    @method_decorator(login_required)
    def get(self, request):
        raise NotImplementedError("Not implemented yet.")


class LikePostView(View):
    @method_decorator(login_required)
    def post(self, request, pk):
        raise NotImplementedError("Not implemented yet.")


class DeleteCommentView(View):
    @method_decorator(login_required)
    def post(self, request, pk, comment_id):
        raise NotImplementedError("Not implemented yet.")
