import os
import csv
from django.contrib.auth.models import User
from projects.models import Person

from dusp.config import data_dir

#password = User.objects.make_random_password()
#user.set_password(password)

def mit_email_sim(person):
    names = person.full_name.split()
    first = names[0][0]
    last = names[-1]
    account = (first + last).lower()
    return account

def add_fake_user_accounts_from_existing_persons():
    csv_file = os.path.join(data_dir, 'generated_users.csv')
    with open(csv_file, "w") as f:
        people = Person.objects.all()
        writer = csv.DictWriter(f, ['name', 'user_id', 'username', 'password'])
        writer.writeheader()
        for p in people:
            account = mit_email_sim(p)
            fake_email = account + "@mit.edu"
            user = User()
            user.email = fake_email
            user.username = account
            pword = account
            user.set_password(pword)
            user.save()
            p.account = user
            p.save()
            writer.writerow({
                'name':p.full_name,
                'user_id':user.id,
                'username':user.username,
                'password':pword,
                })



