from projects.models import *
from django.contrib.auth.models import User
from rest_framework import serializers
"""
Serializer notes:
    `restore_object` is called to reinstantiate objects from their
    representative dictionaries.
"""


class PersonSerializer(serializers.ModelSerializer):
    interests = serializers.PrimaryKeyRelatedField(many=True)
    account = serializers.PrimaryKeyRelatedField()
    class Meta:
        model = Person
        fields = (
            'id',
            'account',
            'full_name',
            'official_title',
            'status',
            'picture',
            'home_page',
            'bio',
            'interests',
            'email',
                )

class UserSerializer(serializers.ModelSerializer):
    profile = PersonSerializer()
    class Meta:
        model = User
        fields = (
                "id", "username", "profile"
                )

class ProjectSerializer(serializers.ModelSerializer):
    people = serializers.PrimaryKeyRelatedField(many=True)
    # cities = serializers.PrimaryKeyRelatedField(many=True)
    countries = serializers.PrimaryKeyRelatedField(many=True)
    topics = serializers.PrimaryKeyRelatedField(many=True)
    class Meta:
        model = Project
        fields = (
            'id',
            'title',
            'people',
            'type',
            'website',
            'description',
            'partners',
            # 'cities',
            'countries',
            'topics',
            'start_year',
            'end_year',
                )

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = (
            'id',
            'title',
            'collection',
            'description',
                )

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = (
            'id',
            'name',
            'official_name',
            'country_id',
                )


