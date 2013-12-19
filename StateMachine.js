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
			
		}
	}

	var DocumentManager = function(machineName, elementSelectors) {
		this.setState = function(newState) {
			for (var i = 0; i < elementSelectors.length; i++) {
				var elems = document.querySelectorAll(elementSelectors[i]);
				for (var j = 0; j < elems.length; j++) {
					elems[j].setAttribute("[data-" + machineName + "]", newState);
				}
			}
		}
		this.registerEvent = function(event, element) {

		}
	}
	var StateMachine = function(machine) {
		this.Machine = new Machine(machine);
		this.Document = new DocumentManager(machine.Name, getElementSelectors(machine));
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
})();
