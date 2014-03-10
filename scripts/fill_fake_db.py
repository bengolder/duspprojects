import sys
import random
from test.generators import DUSPGenerator
from pprint import pprint

from projects.models import (
        Person,
        Topic,
        Project,
        Publication,
        City,
        Country,
        )

sys.path.append("scripts")
# run this after making all people
from add_users import add_fake_user_accounts_from_existing_persons as add_accounts

# make people
# give them projects that have topics
class DB_Faker:
    def __init__(self):
        self.gen = DUSPGenerator()
        self.people = []
        self.projects = []
        self.topics = []
        self.countries = []

    def test_gens(self):
        pprint( self.gen.topic() )
        pprint( self.gen.project() )
        pprint( self.gen.professor() )

    def make_people(self, n=20):
        for i in range(n):
            person_data = self.gen.professor()
            p = Person(**person_data)
            p.save()
            self.people.append(p)
        add_accounts()

    def make_topics(self, n=50):
        all_titles = set()
        for i in range(n/6):
            topic_titles = self.gen.topic()
            for title in topic_titles:
                if title not in all_titles:
                    all_titles.add(title)
                    t = Topic(title=title)
                    t.save()
                    self.topics.append(t)

    def make_projects(self, n=25):
        for i in range(n):
            project_data = self.gen.project()
            num_authors = random.choice([1,1,1,1,2,3])
            authors = random.sample(self.people, num_authors)
            num_topics = random.randint(3,6)
            topics = random.sample(self.topics, num_topics)
            p = Project(
                    title=project_data['title'],
                    description=project_data['abstract']
                    )
            p.save()
            for a in authors:
                p.people.add(a)
            p.save()
            countries = ['United States' for n in range(3)]
            countries.append(project_data['country'])
            country = random.choice(countries)
            c, created = Country.objects.get_or_create(name=country)
            if created:
                c.save()
            p.countries.add(c)
            p.save()
            for t in topics:
                p.topics.add(t)
            p.save()


def main():
    faker = DB_Faker()
    faker.test_gens()
    faker.make_topics(   50 )
    faker.make_people(   20 )
    faker.make_projects( 25 )

main()








