(function() {
	//get rid of them slashes
	var sanitizeSelector = function(selector) {
		return selector.split("/")[0];
	}
	var Machine = function(graph) {
		this.currentState = graph.states[0];
		
		function getTransition(state, key) {
			for (var i = 0; i < state.on.length; i++) {
				if (state.on[i].event == key) {
					return state.on[i];
				}
			}
		}

		this.transition = function(transitionKey) {
			var transition = getTransition(this.currentState, transitionKey);
			if (!transition) throw "Invalid transition for this state.";
			for (var i = 0; i < graph.states.length; i++) {
				if (graph.states[i].state == transition.to) {
					this.currentState = graph.states[i];
					return this.currentState;
				}
			}
			throw new "No valid state to transition to for this key."
		}
	}

	var DocumentManager = function(machineName, elementSelectors) {
		this.boundEvents = [];
		this.bindEvents = function(state) {
			var ons = state.on;
			for (var i = 0; i < ons.length; i++) {
				var trigger = ons[i].event;
				if (trigger.indexOf("/") >= 0) { //this is event-based
					var picked = trigger.split("/");
					var element = document.querySelectorAll(picked[0])[0];
					if (! element) throw "Invalid selector."
					this.bindEvent(element, picked[1], ons[i].event);
				}
			}
		}
		this.bindEvent = function(element,event, nextState) {
			var bound = {
				element:element, event:event, handler: function() {
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
				var elems = document.querySelectorAll(sanitizeSelector(elementSelectors[i]));
				for (var j = 0; j < elems.length; j++) {
					elems[j].setAttribute("data-" + machineName, newState.state);
				}
			}
			this.bindEvents(newState);
		}
	}

	var getElementSelectors = function(machine) {
		var selectors = [];
		for (var i = 0; i < machine.states.length; i++) {
			for (j = 0; j < machine.states[i].on.length; j++) {
				selectors.push(sanitizeSelector(machine.states[i].on[j].event));
			}
		}
		return selectors.concat(machine.elements);
	}

	var StateMachine = function(machine) {
		this.Machine = new Machine(machine);
		this.Document = new DocumentManager(machine.name, getElementSelectors(machine));
		this.Document.bindEvents(this.Machine.currentState);

		this.transition = function(transitionKey) {
			var next = this.Machine.transition(transitionKey);
			this.Document.setState(next);
		}
	};
	var Machines = function() {
		this.Machines = [];
		this.add = function(machine) {
			if (this.Machines[machine.name]) throw "Machine with this name already exists."
			this.Machines[machine.name] = new StateMachine(machine);
		}
		this.remove = function(name) {
			this.Machines[name].unregister();
			delete this.Machines[name];
		}
	}
	window.CState = new Machines();
})();
