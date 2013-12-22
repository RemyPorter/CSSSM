(function() {
	//get rid of them slashes
	var elementSelector = function(selector) {
		return selector.split("/")[0];
	}
	//given a machine, find all of the elements it should manage.
	var getElementSelectors = function(machine) {
		var selectors = [];
		for (var i = 0; i < machine.states.length; i++) {
			for (j = 0; j < machine.states[i].on.length; j++) {
				selectors.push(elementSelector(machine.states[i].on[j].event));
			}
		}
		return selectors.concat(machine.elements);
	}

	//A simple state machine. Follows states by transition.
	var Machine = function(graph) {
		//parse out the state map into a lookup table
		this.stateMap = {};
		for (var i = 0; i < graph.states.length; i++) { //build the root table first
			this.stateMap[graph.states[i].state] = graph.states[i];
		}
		for (var i = 0; i < graph.states.length; i++) { //now, for each root node, build a look up table for each transition
			var ons = this.stateMap[graph.states[i].state].on;
			this.stateMap[graph.states[i].state].lookup = {};
			for (var j = 0; j < ons.length; j++) {
				this.stateMap[graph.states[i].state].lookup[ons[j].event] = this.stateMap[ons[j].to];
			}
		}
		this.currentState = graph.states[0]; //default to the first
		
		function getTransition(state, key) {
			return state.lookup[key];
		}

		this.transition = function(transitionKey) {
			var transition = getTransition(this.currentState, transitionKey);
			if (!transition) throw "Invalid transition for this state.";
			this.currentState = transition;
			return this.currentState;
		}
	}

	//This object worries about interacting with the DOM.
	//Handles setting the data-* attr, and binding events.
	var DocumentManager = function(machineName, root, elementSelectors) {
		var ruleForEvent = function(eventTag) {
			if (eventTag.indexOf("keypress") >= 0) {
				var startAt = eventTag.indexOf("(") + 1;
				var stopAt = eventTag.indexOf(")");
				var keys = eventTag.substring(startAt, stopAt).split(",");	
				return function(event) {
					return keys.indexOf(event.keyCode + "") >= 0;
				}
			}
			return function() { return true; }
		}
		this.boundEvents = [];
		this.bindEvents = function(state) {
			var ons = state.on;
			for (var i = 0; i < ons.length; i++) {
				var trigger = ons[i].event;
				if (trigger.indexOf("/") >= 0) { //this is event-based
					var picked = trigger.split("/");
					var element = root.querySelector(picked.shift());
					if (element) {
						for (var j = 0; j < picked.length; j++) {
							var actual = picked[j].split("(")[0]; //this handles keybased events
							this.bindEvent(element, actual, ons[i].event, ruleForEvent(picked[j]));
						}
					}
				}
			}
		}
		this.bindEvent = function(element,event, nextState, rule) {
			var bound = {
				element:element, event:event, handler: function(evt) {
					if (rule(evt))
						CState.Machines[machineName].transition(nextState);
				}
			}
			element.addEventListener(event, bound.handler);
			this.boundEvents.push(bound);
		}
		this.unbindEvents = function() {
			var ev;
			while(ev = this.boundEvents.shift()) {
				ev.element.removeEventListener(ev.event, ev.handler);
			}
		}
		this.setState = function(newState) {
			this.unbindEvents();
			for (var i = 0; i < elementSelectors.length; i++) {
				var elems = root.querySelectorAll(elementSelector(elementSelectors[i]));
				for (var j = 0; j < elems.length; j++) {
					elems[j].setAttribute("data-" + machineName, newState.state);
				}
			}
			this.bindEvents(newState);
		}
	}
	//Facade that sits atop the Machine & DocManager
	var StateMachine = function(rootElement, machine) {
		var root = null;
		if (typeof(rootElement) == "string") {
			root = document.querySelector(rootElement);
		} else {
			root = rootElement;
		}
		this.Machine = new Machine(machine);
		this.Document = new DocumentManager(machine.name, root, getElementSelectors(machine));
		this.Document.bindEvents(this.Machine.currentState);

		this.transition = function(transitionKey) {
			var next = this.Machine.transition(transitionKey);
			this.Document.setState(next);
		}
	};
	//Wrapper to govern machines.
	var Machines = function() {
		this.Machines = [];
		this.add = function(rootElement, machine) {
			if (this.Machines[machine.name]) throw "Machine with this name already exists."
			this.Machines[machine.name] = new StateMachine(rootElement, machine);
		}
		this.remove = function(name) {
			this.Machines[name].unregister();
			delete this.Machines[name];
		}
	}
	window.CState = new Machines();
})();
