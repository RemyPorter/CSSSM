(function() {
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
		this.setState = function(newState) {
			for (var i = 0; i < elementSelectors.length; i++) {
				var elems = document.querySelectorAll(elementSelectors[i]);
				for (var j = 0; j < elems.length; j++) {
					elems[j].setAttribute("data-" + machineName, newState);
				}
			}
		}
		this.registerEvent = function(event, element) {
			//eventually, I'll use this to tie transition keys to DOM events.
		}
		this.unregisterEvent = function(event, element) {
			//and a ditto
		}
	}

	var getElementSelectors = function(machine) {
		var selectors = [];
		for (var i = 0; i < machine.states.length; i++) {
			for (j = 0; j < machine.states[i].on.length; j++) {
				selectors.push(machine.states[i].on[j].event);
			}
		}
		return selectors.concat(machine.elements);
	}

	var StateMachine = function(machine) {
		this.Machine = new Machine(machine);
		this.Document = new DocumentManager(machine.name, getElementSelectors(machine));

		this.transition = function(transitionKey) {
			var next = this.Machine.transition(transitionKey);
			this.Document.setState(next.state);
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
