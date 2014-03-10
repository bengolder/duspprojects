from __future__ import unicode_literals
from faker.providers import BaseProvider
from pprint import pprint

class Professor(BaseProvider):

    faculty_types = [
            "Assistant Professor",
            "Associate Professor",
            "Adjunct Professor",
            "Professor",
            "Professor Emeritus",
            "Visiting Professor",
            ]

    @classmethod
    def faculty_type(cls):
        return cls.random_element(cls.faculty_types)


