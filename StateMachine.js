(function() {
	var Machine = function(graph) {
		this.currentState = graph.states[0];
		
		this.transition = function(transitionKey) {

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
			this.Machines.push(new StateMachine(machine));
		}
	}
})();
