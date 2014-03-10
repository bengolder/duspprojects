#coding: utf-8
from __future__ import unicode_literals
import random
from faker.providers import BaseProvider

class Project(BaseProvider):
    formats = [
            "{{verb}} {{noun}}",
            "{{verb}} for {{noun}}",
            "{{verb}} and {{verb}} {{noun}} {{project_type}}",
            "{{verb}} {{noun}} in {{location}}",
            "{{verb}} {{adjective}} {{noun}} in {{location}}",
            "{{verb}} {{adjective}} {{adjective}} {{noun}} in {{location}}",
            "{{verb}} {{noun}} {{project_type}}",
            "{{verb}} for {{noun}} {{project_type}}",
            "{{noun}} for {{noun}} {{project_type}}",
            "{{verb}} {{adjective}} {{noun}} {{project_type}}",
            "{{adjective}} {{noun}} {{project_type}}",
            "{{adjective}} {{noun}} in {{location}}",
            "{{adjective}} {{adjective}} {{noun}} {{project_type}}",
            "{{adjective}} {{noun}}: {{location}}",
            "{{adjective}} {{noun}} {{project_type}}: {{location}}",
            "{{adjective}} Initiative on {{noun}}",
            "{{location}} {{noun}} {{project_type}}",
            "{{location}} {{adjective}} {{noun}}",
            "{{location}} {{adjective}} {{noun}} {{project_type}}",
            "{{location}} {{project_type}}",
            "{{noun}} {{project_type}}",
            "{{noun}} {{noun}} {{project_type}}",
            "{{noun}} and {{noun}} {{project_type}}",
            "{{noun}} & {{noun}} {{project_type}}",
            "{{noun}} {{project_type}}: {{location}}",
            "Program for {{adjective}} {{noun}} Studies",
            "Center for {{adjective}} {{noun}}",
            ]

    project_types = [
            "Seminar",
            "Workshop",
            "Design Workshop",
            "Practicum",
            "Program",
            "Project",
            "Studio",
            "Design Studio",
            "Planning Studio",
            "Assessment Project",
            "Initiative",
            "Research Network",
            "Lab",
            "Design Lab",
            "Research Lab",
            "Theory Lab",
            "Symposium",
            "Colloquium",
            ]

    verbs = [
            "Assessing",
            "Analyzing",
            "Mobilizing",
            "Mapping",
            "Documenting",
            "Developing",
            "Crowdsourcing",
            "Creating",
            "Managing",
            "Prototyping",
            "Measuring",
            "Placemaking",
            "Leading",
            "Designing",
            "Negotiating",
            "Leveraging",
            ]

    adjectives = [
            "Cultural",
            "Complex",
            "Ecological",
            "Political",
            "Financial",
            "Bottom Up",
            "Regional",
            "International",
            "Accessible",
            "Sustainable",
            "Adaptive",
            "Informal",
            "Participatory",
            "Digital",
            "Resilient",
            "Advanced",
            "Civic",
            "Smart",
            "Entrepreneurial",
            "Effective",
            "Urban",
            "Social",
            "Equitable",
            "Local",
            "Geographic",
            "Creative",
            "Essential",
            "Agile",
            ]

    nouns = [
            "Leverage",
            "Property Rights",
            "Mobile Technology",
            "Objectives",
            "Alternatives",
            "Information Systems",
            "Anchor Institutions",
            "Land Use",
            "Technology",
            "Industrial Land Use",
            "Innovation",
            "Innovation Districts",
            "Infrastructure",
            "Housing",
            "Manufacturing",
            "Small Manufacturing",
            "Small Businesses",
            "Manufacturing Hubs",
            "Cities",
            "Urbanism",
            "Neighborhoods",
            "Transportation",
            "Markets",
            "Streets",
            "Mobility",
            "Equity",
            "Accessibility",
            "Economic Mobility",
            "Economies",
            "Engagement",
            "Landscapes",
            "Citizenship",
            "Leadership",
            "Sanitation",
            "Energy Use",
            "Health",
            "Finance",
            "Agriculture",
            "Urban Agriculture",
            "Food Systems",
            "Energy",
            "Energy Systems",
            "Data Collection",
            "Open Data",
            "Public Space",
            "Education",
            "Entrepreneurship",
            "GIS",
            "Poverty Alleviation",
            "Knowledge Economies",
            "Climate Change",
            "Food",
            "Food Systems",
            "Social Justice",
            "Educational Technology",
            "Economic Resilience",
            "Stakeholder Engagement",
            "Real Estate",
            "Real Estate Development",
            "Real Estate Finance",
            "Ecology",
            "Urban Form",
            "Risk Management",
            "Disaster Mitigation",
            "New Economies",
            "New Media",
            "Sanitation",
            "Sanitation Systems",
            "Decision Making",
            "Communities",
            "Human Rights",
            "Creative Economy",
            "Policy",
            "Policies",
            "Development Finance",
            "Environmental Policy",
            "Complexity",
            ]

    locations = [
            ("United States",[
                "New England",
                "St. Louis",
                "Detroit",
                "Baltimore",
                "Boston",
                "Cambridge",
                "Washington D.C.",]),
            ("Singapore",[ "Singapore",]),
            ("Brazil",[ "São Paulo",]),
            ("Bangladesh",[ "Dhaka",]),
            ("Ghana",[ "Accra",]),
            ("China",[
                "Shanghai",
                "Tianjin",
                "Beijing",]),
            ("Colombia",[ "Medellín", "Bogotá",]),
            ("Vietnam",[ "Ho Chi Minh City",]),
            ("South Korea",[ "Seoul",]),
            ("Chile",[ "Santiago de Chile",]),
            ("Spain",[ "Madrid", "Barcelona",]),
            ("Russia",[ "Moscow",]),
            ("South Africa",[ "Cape Town",]),
            ("Germany",[ "Berlin",]),
            ("Mexico",[ "Mexico City",]),
            ("Lebanon",[ "Beirut",]),
            ("Argentina",[ "Buenos Aires",]),
            ("Thailand",[ "Bangkok",]),
            ("Egypt",[ "Cairo",]),
            ("Turkey",[ "Istanbul",]),
            ("India",[ "Delhi", "Mumbai",]),
            ("Indonesia",[ "Jakarta",]),
            ("Nigeria",[ "Lagos",]),
            ("Philippines",[ "Manila",]),
            ("Japan",[ "Tokyo",]),
            ("Malaysia",[ "Kuala Lumpur",]),
            ("Italy",[ "Venice",]),
            ("France",[ "Paris",]),
            ("United Kingdom",[ "London",]),
            ("Morocco",[]),
            ("Kenya",[ "Nairobi",]),
            ("Mozambique",[ "Maputo",]),
            ("Pakistan",[ "Karachi",]),
            ]

    @classmethod
    def noun(cls):
        return cls.random_element(cls.nouns)
    @classmethod
    def verb(cls):
        return cls.random_element(cls.verbs)
    @classmethod
    def adjective(cls):
        return cls.random_element(cls.adjectives)
    @classmethod
    def location(cls):
        country, cities = cls.random_element(cls.locations)
        if not cities:
            return country
        else:
            if int(random.random()):
                return country
            else:
                return random.choice(cities)
    @classmethod
    def location_tuple(cls):
        return cls.random_element(cls.locations)

    @classmethod
    def location_with_country(cls):
        country, cities = cls.random_element(cls.locations)
        if not cities:
            item = country
        else:
            if int(random.random()):
                item = country
            else:
                item = random.choice(cities)
        return (item, country)



    @classmethod
    def project_type(cls):
        return cls.random_element(cls.project_types)

    def project_title(self):
        pattern = self.random_element(self.formats)
        return self.generator.parse(pattern)


