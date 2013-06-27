#!/bin/bash

# sizes copied from leaflet-src.js. Search for "var sizes = "
for x in 0.5 1.2 2 3.2
do
	echo -n 'url(data:image/svg+xml;base64,'
	cat swatches.svg | sed -e "s/2.222/$x/" | base64 -w 0
	echo ')'
done
