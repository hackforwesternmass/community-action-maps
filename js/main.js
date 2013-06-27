$(function(){
	$('a.programs-tab').click(function() {
		$('#programs').toggle();
		$('#demos').hide();
		$('#resources').hide();
	});
	$('a.demos-tab').click(function(){
		$('#demos').toggle();
		$('#programs').hide();
		$('#resources').hide();
	});
	$('a.resources-tab').click(function() {
		$('#resources').toggle();
		$('#demos').hide();
		$('#programs').hide();
	});
});
