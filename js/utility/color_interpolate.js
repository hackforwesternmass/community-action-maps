// Helper function
function hsv_to_rgb(h,s,v) {
	if(s === 0){
		r = v;
		g = v;
		b = v;
	} else {
		var i, f, m, n, k;

		i = Math.floor(h / 60);
		f = h / 60 - i;
		m = v * (1 - s);
		n = v * (1 - s * f);
		k = v * (1 - s * (1 - f));

		switch(i){
			case 0:
				r= v;
				g = k;
				b = m;
			break;
			case 1:
				r = n;
				g = v;
				b = m;
			break;
			case 2:
				r = m;
				g = v;
				b = k;
			break;
			case 3:
				r = m;
				g = n;
				b = v;
			break;
			case 4:
				r = k;
				g = m;
				b = v;
			break;
			case 5:
				r = v;
				g = m;
				b = n;
			break;
			default:
			break;
		}
	}

	r = Math.floor(r * 0xff).toString(16);
	g = Math.floor(g * 0xff).toString(16);
	b = Math.floor(b * 0xff).toString(16);

	if(r.length == 1) r = '0' + r;
	if(g.length == 1) g = '0' + g;
	if(b.length == 1) b = '0' + b;

	return "#" + r + g + b;
}

// pass a number between 0 and one, returns an html color (eg "#ffffff")
// between low_color and high_color
function value_to_color(value, high_color, low_color) {
	color = {}
	for (k in low_color) {
		color[k] = value * (high_color[k] - low_color[k]) + low_color[k];
	}
	return hsv_to_rgb(color.hue, color.saturation, color.value);
}

//pass in an array of numbers and find a mapping (using normalization) to use it in value_to_color to output an array of colors
function map_colors(data, high_color, low_color) { 
	mmax = Math.max.apply(Math, data);
	mmin = Math.min.apply(Math, data);
	colordata = {};		
	for (k in data) {
		//console.log(data[k]);
		metric = data[k];
		value = (data[k] - mmin)/(mmax - mmin);
		//console.log(value);
		color = value_to_color(value, high_color, low_color);
		//console.log(color);
		colordata[metric] = color;
		//console.log(colordata);	
	}
	return colordata;
}
