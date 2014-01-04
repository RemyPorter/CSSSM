(function() {
	//get rid of them slashes
	var elementSelector = function(selector) {
		return selector.split("/")[0];
	}
	//given a machine, find all of the elements it should manage.
	var getElementSelectors = function(machine) {
		var selectors = [];
		machine.states.forEach(function(state) {
			state.on.forEach(function(evt) {
				selectors.push(elementSelector(evt.event));
			});
		});
		return selectors.concat(machine.elements);
	}

	//A simple state machine. Follows states by transition.
	var Machine = function(graph) {
		//parse out the state map into a lookup table
		this.stateMap = {};
		var self = this;
		graph.states.forEach(function(state) {
			self.stateMap[state.state] = state;
		});
		graph.states.forEach(function(state) {
			var ons = self.stateMap[state.state].on;
			self.stateMap[state.state].lookup = {};
			ons.forEach(function(on) {
				self.stateMap[state.state].lookup[on.event] = self.stateMap[on.to];
			});
		});
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
		var getParameters = function(text) {
			var startAt = text.indexOf("(") + 1;
			var stopAt = text.indexOf(")");

			var res = text.substring(startAt, stopAt).split(",");
			if (res[0] == "" && res.length == 1) return null;
			return res;
		}
		var keypressRule = function(eventTag) {
			var keys = getParameters(eventTag);	
			if (keys === null) return function() { return true; } //if they didn't supply params, every key works
			return function(event) {
				return keys.indexOf(event.keyCode + "") >= 0;
			}
		}
		var mouseRule = function(eventTag) {
			var buttons = getParameters(eventTag);
			var mapped = [];

			if (buttons === null) return function() { return true; }
			return function(event) {
				return buttons.indexOf(event.buttons + "") >= 0;
			}
		}
		var ruleForEvent = function(eventTag) {
			if (eventTag.indexOf("keypress") >= 0) {
				keypressRule(eventTag);
			} else if (eventTag.indexOf("mousedown") >= 0 || eventTag.indexOf("mouseup") >= 0) {
				return mouseRule(eventTag);
			}
			return function() { return true; }
		}
		this.boundEvents = [];
		this.bindEvents = function(state) {
			var ons = state.on;
			var self = this;
			ons.forEach(function(on) {
				var trigger = on.event;
				if (trigger.indexOf("/") >= 0) { //this is event-based
					var picked = trigger.split("/");
					var element = root.querySelector(picked.shift());
					if (element) {
						picked.forEach(function(p) {
							var actual = p.split("(")[0]; //this handles keybased events
							self.bindEvent(element, actual, on.event, ruleForEvent(p));
						});
					}
				}
			});
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
			elementSelectors.forEach(function(es) {
				var elems = root.querySelectorAll(elementSelector(es));
				for (var j = 0; j < elems.length; j++) {
					elems[j].setAttribute("data-" + machineName, newState.state);
				}
			});
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
