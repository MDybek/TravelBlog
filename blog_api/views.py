import json

from django.http import JsonResponse
from django.views import View
from django.contrib.auth.decorators import login_required
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import CommentSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from rest_framework.permissions import AllowAny
from rest_framework import serializers

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
                'id': post.id,
                'title': post.title,
                'created_at': post.created_at,
                'tags': post.tags,
                'image': post.image if post.image else None
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
                'created_at': post.created_at,
                'image_url': post.image,
                'author_id': post.author.id
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
                    'image': post.image if post.image else None
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
                    'id': post.id,
                    'title': post.title,
                    'created_at': post.created_at,
                    'tags': post.tags,
                    'image': post.image if post.image else None
                }
                results.append(post_data)

            return JsonResponse(results, safe=False)
        else:
            return JsonResponse({'error': 'Query parameter is required'}, status=400)


class UserRegistrationView(View):
    def post(self, request):
        content_type = request.content_type

        if content_type == 'application/json':
            data = json.loads(request.body)
        elif content_type == 'application/x-www-form-urlencoded':
            data = request.POST
        else:
            return JsonResponse({'error': 'Unsupported content type'}, status=400)

        username = data.get('username')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')

        user = User(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password
        )
        user.save()

        response = {
            'message': 'User registered successfully.',
            'user_id': user.id
        }

        return JsonResponse(response)


class UserLoginView(View):
    def post(self, request):
        content_type = request.content_type

        if content_type == 'application/json':
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        elif content_type == 'application/x-www-form-urlencoded':
            username = request.POST.get('username')
            password = request.POST.get('password')
        else:
            return JsonResponse({'error': 'Unsupported content type'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            response = {
                'message': 'Login successful.',
                'token': token.key,
                'user': user.first_name + " " + user.last_name,
                'user_id': user.id
            }
            return JsonResponse(response)
        else:
            response = {
                'message': 'Invalid credentials.'
            }
            return JsonResponse(response, status=401)


class UserLogoutView(View):
    def post(self, request):
        raise NotImplementedError("Not implemented yet.")


class CreateBlogPostView(View):
    def post(self, request):
        content_type = request.content_type

        if content_type == 'application/json':
            data = json.loads(request.body)
            title = data.get('title')
            tags = data.get('tags')
            content = data.get('content')
            image = data.get('image')
        elif content_type == 'application/x-www-form-urlencoded':
            title = request.POST.get('title')
            tags = request.POST.get('tags')
            content = request.POST.get('content')
            image = request.POST.get('image')
        else:
            return JsonResponse({'error': 'Unsupported content type'}, status=400)

        auth_token = request.META.get('HTTP_AUTHORIZATION', '')
        token_key = auth_token.split('Token ')[1] if auth_token.startswith('Token ') else ''
        try:
            token = Token.objects.get(key=token_key)
        except Token.DoesNotExist:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        user = token.user

        if not title or not tags or not content:
            return JsonResponse({'error': 'All fields must be filled'}, status=400)

        if len(title) > 500 or len(tags) > 500:
            return JsonResponse({'error': 'Title and tags must not exceed 500 characters'}, status=400)

        post = Post(title=title, tags=tags, content=content, author=user, image=image)
        post.save()

        response = {
            'message': 'Post created successfully.',
            'post_id': post.id,
            'title': post.title,
            'tags': post.tags,
            'content': post.content,
            'author': post.author.username,
            'created_at': post.created_at,
            'image': post.image
        }
        return JsonResponse(response)


class EditBlogPostView(View):
    def post(self, request, pk):
        content_type = request.content_type

        if content_type == 'application/json':
            data = json.loads(request.body)
            title = data.get('title')
            tags = data.get('tags')
            content = data.get('content')
            image = data.get('image')
        elif content_type == 'application/x-www-form-urlencoded':
            title = request.POST.get('title')
            tags = request.POST.get('tags')
            content = request.POST.get('content')
            image = request.POST.get('image')
        else:
            return JsonResponse({'error': 'Unsupported content type'}, status=400)

        auth_token = request.META.get('HTTP_AUTHORIZATION', '')
        token_key = auth_token.split('Token ')[1] if auth_token.startswith('Token ') else ''
        try:
            token = Token.objects.get(key=token_key)
        except Token.DoesNotExist:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        user = token.user

        try:
            post = Post.objects.get(pk=pk, author=user)
        except Post.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)

        post.title = title
        post.tags = tags
        post.content = content
        post.image = image
        post.save()

        return JsonResponse({'message': 'Post updated successfully.'})


class DeleteBlogPostView(View):
    def post(self, request, pk):
        auth_token = request.META.get('HTTP_AUTHORIZATION', '')
        token_key = auth_token.split('Token ')[1] if auth_token.startswith('Token ') else ''
        try:
            token = Token.objects.get(key=token_key)
        except Token.DoesNotExist:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        user = token.user

        try:
            post = Post.objects.get(pk=pk, author=user)
        except Post.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)

        post.delete()

        return JsonResponse({'success': True, 'message': 'Post deleted successfully.'})


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    def get_author(self, comment):
        return f"{comment.author.first_name} {comment.author.last_name}"

    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_at', 'post', 'author']


class DisplayCommentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, post_id):
        comments = Comment.objects.filter(post_id=post_id).order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)

        serialized_data = serializer.data
        for comment_data in serialized_data:
            comment = Comment.objects.get(id=comment_data['id'])
            comment_data['user_id'] = comment.author_id

        return Response(serialized_data)


class CreateCommentView(View):
    def post(self, request, pk):
        auth_token = request.META.get('HTTP_AUTHORIZATION', '')
        token_key = auth_token.split('Token ')[1] if auth_token.startswith('Token ') else ''
        try:
            token = Token.objects.get(key=token_key)
        except Token.DoesNotExist:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        user = token.user
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)

        content = data.get('content')
        if not content:
            return JsonResponse({'error': 'Content field is required'}, status=400)

        comment = Comment(post=post, author=user, content=content)
        comment.save()

        return JsonResponse({'success': True, 'message': 'Comment created successfully.'})


class UserProfileView(View):
    def get(self, request):
        auth_token = request.META.get('HTTP_AUTHORIZATION', '')
        token_key = auth_token.split('Token ')[1] if auth_token.startswith('Token ') else ''
        try:
            token = Token.objects.get(key=token_key)
        except Token.DoesNotExist:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        user = token.user

        profile_data = {
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }
        return JsonResponse(profile_data)

    def post(self, request):
        auth_token = request.META.get('HTTP_AUTHORIZATION', '')
        token_key = auth_token.split('Token ')[1] if auth_token.startswith('Token ') else ''
        try:
            token = Token.objects.get(key=token_key)
        except Token.DoesNotExist:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        user = token.user

        content_type = request.content_type
        if content_type == 'application/json':
            data = json.loads(request.body)
            newUsername = data.get('username')
            newFirstName = data.get('first_name')
            newLastName = data.get('last_name')
            newEmail = data.get('email')
        elif content_type == 'application/x-www-form-urlencoded':
            newUsername = request.POST.get('username')
            newFirstName = request.POST.get('first_name')
            newLastName = request.POST.get('last_name')
            newEmail = request.POST.get('email')
        else:
            return JsonResponse({'error': 'Unsupported content type'}, status=400)

        if newUsername != user.username and newUsername:
            if User.objects.filter(username=newUsername).exclude(id=user.id).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)

        if newFirstName != user.first_name:
            user.first_name = newFirstName
        if newLastName != user.last_name:
            user.last_name = newLastName
        if newEmail != user.email:
            user.email = newEmail

        user.save()

        return JsonResponse({'success': True, 'message': 'User profile updated successfully.'})


class LikePostView(View):
    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)

        user = request.user
        post.likes.add(user)

        subject = 'Twój post został polubiony!'
        message = f'Użytkownik {user.username} polubił Twój post "{post.title}".'
        from_email = 'kontakt_blog@gmail.com'
        to_email = post.author.email
        send_mail(subject, message, from_email, [to_email])

        return JsonResponse({'message': 'Post liked successfully.'})


class DeleteCommentView(View):
    def post(self, request, pk, comment_id):
        auth_token = request.META.get('HTTP_AUTHORIZATION', '')
        token_key = auth_token.split('Token ')[1] if auth_token.startswith('Token ') else ''
        try:
            token = Token.objects.get(key=token_key)
        except Token.DoesNotExist:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        user = token.user

        try:
            comment = Comment.objects.get(pk=comment_id, post=pk)
        except Comment.DoesNotExist:
            return JsonResponse({'error': 'Comment not found'}, status=404)

        if comment.author != user:
            return JsonResponse({'error': 'You do not have permission to delete this comment'}, status=403)

        comment.delete()

        return JsonResponse({'success': True, 'message': 'Comment deleted successfully.'})


class EditCommentView(View):
    def post(self, request, pk, comment_id):
        auth_token = request.META.get('HTTP_AUTHORIZATION', '')
        token_key = auth_token.split('Token ')[1] if auth_token.startswith('Token ') else ''
        try:
            token = Token.objects.get(key=token_key)
        except Token.DoesNotExist:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        user = token.user

        try:
            comment = Comment.objects.get(pk=comment_id, post=pk)
        except Comment.DoesNotExist:
            return JsonResponse({'error': 'Comment not found'}, status=404)

        if comment.author != user:
            return JsonResponse({'error': 'You do not have permission to edit this comment'}, status=403)

        content_type = request.content_type
        if content_type == 'application/json':
            data = json.loads(request.body)
            content = data.get('content')
        else:
            return JsonResponse({'error': 'Unsupported content type'}, status=400)

        if not content:
            return JsonResponse({'error': 'Comment content is required'}, status=400)

        comment.content = content
        comment.save()

        return JsonResponse({'success': True, 'message': 'Comment edited successfully.'})
