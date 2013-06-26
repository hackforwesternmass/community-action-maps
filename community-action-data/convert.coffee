# install coffeescript, nodejs
# run: coffee convert.coffee > recipients_per_tract.json

fs = require 'fs'

capital_a = "A".charCodeAt 0

fs.readFile 'in.tsv', 'utf8', (err, data) ->
	return console.log err if err
	lines = data.split '\n'
	grid = []
	for line in lines
		grid.push line.split '\t'
	keys = grid.shift()
	tracts = {}
	for grid_row in grid
		row = {}
		for v, k in grid_row
			row[keys[k].toLowerCase()] = v
		if tracts[row.tract]
			tracts[row.tract] += 1
		else
			tracts[row.tract] = 1
	console.log JSON.stringify tracts
