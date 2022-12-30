// ==UserScript==
// @name         Fpuzzles-Killer_Calc
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a calculator that helps with constructing killer sudoku 
// @author       Ennead
// @match        https://*.f-puzzles.com/*
// @match        https://f-puzzles.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-start
// ==/UserScript==
//
(function() {
	'use strict';

	let calcIcon = '\u{1F5A9}';

	const doShim = function() {

		const calcBtnX = canvas.width - 375;
		const calcX = 1277;
		const calcY = 310;
		const calcW = 287;
		const calcH = 230;
		const num_of_cells = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
		let calc = null;
		let sets = [];

		const totals = function() {
			let ret = [];
			for (let i = 3; i < 45; i++) {
				ret[i] = i;
			}
			return ret;
		};

		const calcButton = new button(calcBtnX, 100, 40, 40, ['Setting'], 'Calc', calcIcon);
		buttons.push(calcButton);

		let calcElemAttr = {
							 'id': 'CalcElem', 
							 'style': 'width: 17.5%;' +
						 	 	 	  'height: 26%;' +
						 	 		  'top: 34.0%;' +
						 	 	 	  'left: 78.4%;' +
						 	 		  'position: fixed;' +
						 	 		  'display: none;'
							}
		const calcElem = document.createElement('div');
		for (let key in calcElemAttr) { calcElem.setAttribute(key, calcElemAttr[key]); }
		document.body.appendChild(calcElem);

		let cellsInputLabelAttr = {
							 'id': 'cellsInputLabel', 
							 'style': 'width: 25%;' +
						 	 	 	  'height: 15%;' +
						 	 		  'top: 5.0%;' +
						 	 	 	  'left: 5.0%;' +
									  'font-size: min(1vh * 16 / 9, 2vw);' +
						 	 		  'position: absolute;'
							}
		const cellsInputLabel = document.createElement('label');
		for (let key in cellsInputLabelAttr) { cellsInputLabel.setAttribute(key, cellsInputLabelAttr[key]); }
		cellsInputLabel.innerHTML = 'Cells:';
		calcElem.appendChild(cellsInputLabel);

		let cellsInputAttr = {
							 'id': 'cellsInput', 
							 'name': 'cellsInput', 
							 'overflow': 'hidden',
							 'style': 'width: 25%;' +
						 	 	 	  'height: 15%;' +
									  'border: min(0.25vh * 16 / 9, 0.35vw) solid #000000;' +
						 	 		  'top: 15.0%;' +
						 	 	 	  'left: 5.0%;' +
									  'font-size: min(1vh * 16 / 9, 2vw);' +
						 	 		  'position: absolute;'
							}
		const cellsInput = document.createElement('select');
		for (let key in cellsInputAttr) { cellsInput.setAttribute(key, cellsInputAttr[key]); }
		calcElem.appendChild(cellsInput);

		num_of_cells.slice(1, 9).map((num) => {
			let opt = document.createElement('option');
			opt.value = num;
			opt.innerHTML = num;
			cellsInput.append(opt);
		});

		let totalLabelAttr = {
							 'id': 'cellsInputLabel', 
							 'style': 'width: 25%;' +
						 	 	 	  'height: 15%;' +
						 	 		  'top: 5.0%;' +
						 	 	 	  'left: 35.0%;' +
									  'font-size: min(1vh * 16 / 9, 2vw);' +
						 	 		  'position: absolute;'
							}
		const totalLabel = document.createElement('label');
		for (let key in totalLabelAttr) { totalLabel.setAttribute(key, totalLabelAttr[key]); }
		totalLabel.innerHTML = 'Total:';
		calcElem.appendChild(totalLabel);

		let totalInputAttr = {
							 'id': 'totalInput', 
							 'name': 'totalInput', 
							 'overflow': 'hidden',
							 'style': 'width: 25%;' +
						 	 	 	  'height: 15%;' +
									  'border: min(0.25vh * 16 / 9, 0.35vw) solid #000000;' +
						 	 		  'top: 15.0%;' +
						 	 		  'bottom: 100.0%;' +
						 	 	 	  'left: 35%;' +
									  'font-size: min(1vh * 16 / 9, 2vw);' +
						 	 		  'position: absolute;'
							}
		const totalInput = document.createElement('select');
		for (let key in totalInputAttr) { totalInput.setAttribute(key, totalInputAttr[key]); }
		calcElem.appendChild(totalInput);

		totals().map((tot) => {
			let opt = document.createElement('option');
			opt.value = tot;
			opt.innerHTML = tot;
			totalInput.append(opt);
		});

		let calcOutputAttr = {
							 'readonly': 'readonly',
							 'id': 'calcOutput', 
							 'style': 'overflow-x: hidden;' +
									  'overflow-y: auto;' +
									  'width: 90%;' +
						 	 	 	  'height: 60%;' +
									  'border: min(0.25vh * 16 / 9, 0.35vw) solid #000000;' +
						 	 		  'top: 33.0%;' +
						 	 	 	  'left: 5.0%;' +
									  'font-size: min(1.2vh * 16 / 9, 2vw);' +
						 	 		  'position: absolute;'
							}
		const calcOutput = document.createElement('div');
		for (let key in calcOutputAttr) { calcOutput.setAttribute(key, calcOutputAttr[key]); }
		calcElem.appendChild(calcOutput);

		let generateSets = function(num_arr, num_i, sub_arr, sub_i, cells, total) {
			let setTotal = 0;
			let set = [];

			if (sub_i == cells) {
				for (let i = 0; i < cells; i++) {
					set[i] = sub_arr[i];
					setTotal += sub_arr[i];
				}

				if (total == setTotal) {
					sets.push(set);
				}

				return;
			}

			if (num_i >= 9) return;

			sub_arr[sub_i] = num_arr[num_i];
			generateSets(num_arr, num_i + 1, sub_arr, sub_i + 1, cells, total);
			generateSets(num_arr, num_i + 1, sub_arr, sub_i, cells, total);
		}

		let doSets = function(cells, total) {
			let subset_arr = [];
			sets = [];

			generateSets(num_of_cells, 0, subset_arr, 0, cells, total);
			return sets;
		}
		
		let doCalculator = function() {
			let cells = document.getElementById('cellsInput').value;
			let total = document.getElementById('totalInput').value;
			let result_str = doSets(cells, total).join('<br>');
			console.log(result_str);

			if (result_str) {
				document.getElementById('calcOutput').innerHTML = '<p>' + result_str + '</p>'
				return;
			}

			document.getElementById('calcOutput').innerHTML = '<p> Not possible... </p>'
		}
		document.getElementById('cellsInput').onchange = () => doCalculator();
		document.getElementById('totalInput').onchange = () => doCalculator();

		let toggleCalcPopup = function() {
			if (!calc) {
				document.getElementById('CalcElem').style.display = 'block';
				calc = true;
				popup = 'Calc';
				return;
			}
			if (calc) {
				document.getElementById('CalcElem').style.display = 'none';
				calc = false;
				popup = null;
				return;
			}
		}

		let drawCalcPopup = function() {
			if (calc) {
				ctx.lineWidth = lineWW;
				ctx.fillStyle = boolSettings['Dark Mode'] ? '#505050' : '#F0F0F0';
				ctx.strokeStyle = '#000000';
				ctx.fillRect(calcX, calcY, calcW, calcH);
				ctx.strokeRect(calcX, calcY, calcW, calcH);
			}
		}

		calcButton.click = function() {
			if (!this.hovering()) return;
			disableInputs = false;
			toggleCalcPopup();
			return true;
		}

		let origDrawScreen = drawScreen;
		drawScreen = function(step, forced) {
			origDrawScreen(step, forced);
			drawCalcPopup();
		}
	}


    if (window.grid) {
        doShim();
    } else {
        document.addEventListener('DOMContentLoaded', (event) => {
            doShim();
        });
    }
})();

