from django.shortcuts import render
from django.views import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator


def login_required_decorator(view_func):
    decorated_view_func = login_required(view_func)
    return decorated_view_func


class BlogPostListView(View):
    @method_decorator(login_required_decorator)
    def get(self, request):
        raise NotImplementedError("Not implemented yet.")


class BlogPostDetailView(View):
    @method_decorator(login_required_decorator)
    def get(self, request, pk):
        raise NotImplementedError("Not implemented yet.")


class TagListView(View):
    def get(self, request):
        raise NotImplementedError("Not implemented yet.")


class SearchView(View):
    def get(self, request):
        raise NotImplementedError("Not implemented yet.")


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
