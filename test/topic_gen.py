from __future__ import unicode_literals
from faker.providers import BaseProvider
import random
import string

class Topic(BaseProvider):

    topics = [
            "Mapping",
            "Crowdsourcing",
            "Prototyping",
            "Measuring",
            "Placemaking",
            "Designing",
            "Negotiating",
            "Property Rights",
            "Mobile Technology",
            "Information Systems",
            "Anchor Institutions",
            "Land Use",
            "Industrial Land Use",
            "Innovation Districts",
            "Infrastructure",
            "Housing",
            "Public Housing",
            "Low-Income Housing",
            "Small Businesses",
            "Manufacturing",
            "Small Manufacturing",
            "Manufacturing Hubs",
            "Urbanism",
            "Neighborhoods",
            "Street Design",
            "Transportation",
            "Mobility",
            "Equality",
            "Economic Mobility",
            "Landscape",
            "Landscape Design",
            "Landscape Ecology",
            "Leadership",
            "Health",
            "Finance",
            "Agriculture",
            "Energy",
            "Open Data",
            "Public Space",
            "Entrepreneurship",
            "GIS",
            "Poverty Alleviation",
            "Climate Change",
            "Food",
            "Social Justice",
            "Education",
            "Educational Technology",
            "Stakeholder Engagement",
            "Real Estate",
            "Real Estate Development",
            "Real Estate Finance",
            "Ecology",
            "Urban Form",
            "Risk Management",
            "Disaster Mitigation",
            "New Economies",
            "Knowledge Economies",
            "Economic Resilience",
            "New Media",
            "Sanitation",
            "Decision Making",
            "Human Rights",
            "Development Finance",
            "Environmental Policy",
            ]

    @classmethod
    def topic(cls):
        return cls.random_element(cls.topics)

    @classmethod
    def several_topics(cls):
        num_items = cls.randomize_nb_elements(5)
        return cls.random_sample(cls.topics, num_items)



