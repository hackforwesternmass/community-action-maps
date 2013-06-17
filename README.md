CommunityACTIONMap! 
===================

CommunityACTIONMap is a tool to view and compare community action agency program services data with the need in the area using Census data.

Install for local development
-----------------------------

Clone the repository from github:

    $ git clone git@github.com:hackforwesternmass/community-action-maps.git community-action-maps

Create and activeate a python virtualenv:

    $ virtualenv community-action-maps
    $ cd community-action-maps
    $ source ./bin/activate

Checkout the django branch:

    $ git checkout -b django origin/django

Install python dependencies:

    $ pip install -r requirements.txt

Start the local webserver:

    $ cd community_action_maps
    $ python manage.py runserver


