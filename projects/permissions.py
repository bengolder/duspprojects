from rest_framework import permissions


class OwnProfileToEdit(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet
        return obj.account == request.user

class IsListedInPeopleOrReadOnly(permissions.BasePermission):
    """
    Custom Permission to only allow the people who are listed on a project to
    change it
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        profile = request.user.profile.id
        if profile:
            try:
                obj.people.get(id=profile.id)
                return True
            except:
                return False
        return False



