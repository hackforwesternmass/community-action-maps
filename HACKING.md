Tools required to hack this project!
===

* Sass
* Compass
* Local httpd (python works!)
* ogr2ogr (for manipulating census data/geographic data) [OPTIONAL]
* optipng [OPTIONAL]

On my debian box
---

`sudo apt-get install ruby-sass ruby-compass python2.7`

Optionals
----
`sudo apt-get install gdal-bin optipng`


Open the page locally
----
`python -m SimpleHTTPServer`
`google-chrome localhost:8000/index.html`