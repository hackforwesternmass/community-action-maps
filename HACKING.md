Tools required to hack this project!
====================================

* [Sass](http://sass-lang.com/)
* [Compass](http://compass-style.org/)
* git (to get the project from github)
* Local httpd (python works!)
* ogr2ogr (for manipulating census data/geographic data) [OPTIONAL]
* [optipng](http://optipng.sourceforge.net/) [OPTIONAL]

On debian
---------

``sudo apt-get install ruby-sass ruby-compass python2.7 git``

Optionals
---------

``sudo apt-get install gdal-bin optipng``


Testing Locally
===============

Firefox
-------

Use File->Open (or ctrl-O) to open up ``index.html``

If this doesn't work (eg you don't see the map overlays) try the instructions for Chrome below.

Chrome
------

Run ``python -m SimpleHTTPServer``

then go to ``http://localhost:8000/index.html``


Update the live demo
====================

To update the [live demo](http://hackforwesternmass.github.io/community-action-maps/) simply push to the ``gh-pages`` branch on github:

``git push origin master:gh-pages``

Please do a normal push (to update the master branch on github) first.

If you're curious, here's [docs for github pages](https://help.github.com/categories/20/articles)
