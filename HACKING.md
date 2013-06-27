Tools required to hack this project!
===

* [Sass](http://sass-lang.com/)
* [Compass](http://compass-style.org/)
* git (to get the project from github)
* Local httpd (python works!)
* ogr2ogr (for manipulating census data/geographic data) [OPTIONAL]
* [optipng](http://optipng.sourceforge.net/) [OPTIONAL]

On my debian box
---

`sudo apt-get install ruby-sass ruby-compass python2.7 git`

Optionals
----
`sudo apt-get install gdal-bin optipng`

Github Pages
----
(in community-action-maps) `git checkout gh-pages`

Currently we've mirrored gh-pages and master if you work on one branch and commit then you need to go to the other and rebase: `git checkout gh-pages && git rebase master && git checkout master` will sync them and switch back to master, you can flip these two.

[More information](https://help.github.com/categories/20/articles)

Open the page locally
----
`python -m SimpleHTTPServer`

`google-chrome localhost:8000/index.html`