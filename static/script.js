/*
 * Part of Edubotics, a Startup Weekend Montreal team, February 2012
 * 
 * Arithmetic game by Marek Zaluski
 *
 * Robot callbacks used:
 * 		robo:match
 *		robo:victory
 *		robo:wrong
 */
var operators = ["+", "−", "×", "÷"];
var entry = ""; // currently entered digits
var expectedResult = ""; // expected numerical result, as a string
var accepting = false; // Input is accepted only when true
var successes = 0; // the game score (resets after scoreTarget is reached)
var scoreTarget = 5; // number of points between congratulatory rounds

// is iOS (for touchstart)
var isios = /iPad|iPhone/i.test(navigator.userAgent);

$(document).ready(ready);

var windowW;
var windowH;

// Shows the intro and starts the game
function beginWithIntro() {
	$('#app').empty().append($(templates.intro))
	$('#intro').hide().fadeIn(2500).delay(1200).fadeOut(800, function() {
		beginGame();
	});
}

// Starts the game, setting up the interface
function beginGame(){
	successes = 0;
	$('#app').empty().append($(templates.layout));
	newQuestion();
}

// Creates the question interface
function prepareQuestion() {
	$('#entry').empty();
	$('#question').css('opacity', 1);
	entry = "";
	var numpad = $('#numpad').empty();
	$.each(Array(10), function(i) {
		var el = $('<div>').addClass('numpad-item')
			.data('number-value', i)
			.text(i)
			.appendTo(numpad);
			if (isios) { // on iOs, use the ontouchstart handler
				el.get(0).ontouchstart = numpadclick;
			} else {
				el.on('click', numpadclick);
			}
	});
	
}

// Update the score display to reflect the score value
// the score value is called 'successes' for some reason
function updateScore() {
	var el = $('#score').empty();
	el.css('width', scoreTarget*100)
	$.each(Array(scoreTarget), function(i) {
		var point = $('<div>').addClass("point");
		if (successes > i) {
			point.addClass('scored');
		}
		point.appendTo(el);
	});
	
}

// Event handler for a click on a number button
function numpadclick() {
	if (!accepting) {
		
		return;
	}
	$t = $(this);
	$t.css('background-color', 'rgba(0, 0, 0, 0.1)');
	
	setTimeout(function() {
		$t.css('background-color', '');
	}, 150);
	var n = $(this).data('number-value');
	var d = entry.length;
	entry += n;
	$('#entry').text(entry);
	if (expectedResult === entry) {
		// Correct
		accepting = false;
		successes ++;
		updateScore();
		window.location = "robo:match";
		
		$('#question').animate({opacity:0}, 3000);
		$('#entry').addClass('correct').animate({opacity: 0}, 3000, function() {
			$('#entry').removeClass('correct').css('opacity', 1);
			if (successes % scoreTarget == 0) {
				victory();
			} else {
				newQuestion();
			}
		});
	};
	
	if (expectedResult[d] != entry[d]) {
		// Wrong
		accepting = false;
		window.location = "robo:wrong";
		$('#entry').addClass("incorrect").animate({opacity: 0}, 1500, function() {
			$('#entry').removeClass('incorrect').css('opacity', 1);
			accepting = true;
			
			console.log("erroneous answer");
			$('#entry').empty();
			entry = "";
		});
	};
}

// Resets the entered digits
function resetEntry() {
	$('#entry').empty();
	entry = "";
}

// Show congratulatory screen and then begin another game
function victory () {
	window.location = "robo:victory";
	$('#app').empty();
	$('#app').append(templates.victory);

	$('#victory').hide().fadeIn(3000).delay(6500).fadeOut(1500, function() {
		$('#app').empty();
		
		beginGame();
	});
}

// Display an arithmetic question, as given by the parameters
// Requires that prepareQuestion() has been called at least once
function startQuestion(a, b, operator) {
	var vars = {
		'operand1': a,
		'operand2': b,
		'operator': operator
	};
	entry = "";
	$('#question').empty().append(Mustache.to_html(templates.question, vars));
	updateScore();
	expectedResult = getResult(a, b, operator).toString();
	accepting = true;
}

// Generate a new question and display it.
function newQuestion() {
	
	var operator = randPick(operators);
	switch (operator) {
		case "+":
			a = randInt(1,9);
			b = randInt(1,9);
			break;
		case "−":
			a = randInt(1,21);
			b = randInt(1,9);
			a = Math.max(a, b);
			b = Math.min(a, b);
			break;
		case "×":
			a = randInt(1, 6);
			b = randInt(1, 6);
			break;
		case "÷":
			a = randInt(1,6);
			b = randInt(1,6);
			a *= b;
			break;
		default:
	}
	prepareQuestion();
	startQuestion(a, b, operator);
}

// This is the document-ready event handler
function ready() {

	windowH = $(window).height();
	windowW = $(window).width();
	
	beginWithIntro();
	$('body').css('height', windowH); // This is to show the background gradient properly
	// otherwise the background repeats incorrectly
	
}

// Given the parameters, get the result of the operation
function getResult(a, b, operator) {
	switch (operator) {
		case "+":
			return a + b;
		case "−":
			return a - b;
		case "×":
			return a * b;
		case "÷":
			return a / b;
		default:
	}
}

// Generate a random integer in the given range
randInt = function(min, max) {
	var d = max - min + 1; // distribution range
	return Math.floor(Math.random() * d + min);
};

// Randomly pick an element out of an array
randPick = function(list) {
	var i = randInt(0, list.length-1);
	return list[i];
}
