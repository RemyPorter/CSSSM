CSSSM
=====

# The CSS State Machine

The purpose of this code is to allow web designers to define a declarative state machine for UI behaviors. This is currently "proof-of-concept" status. A simple declarative style allows for the linking of UI elements to states and events. This makes it easy to build *behavior* into web interfaces without writing code.

**NB**: this is POC code that I knocked out while I was bored in a meeting. It is not performant, and not well tested.

## Key Features

* Declarative definition of behavior
* Declarative event handling
* Allows state-driven CSS

## Defining a Machine
Machines are defined as javascript objects.
<pre><code>
{
	name: "A memorable name for this machine.",
	states: [
		{
			state: "name of the state",
			on: [
				{
					event: ".aCSSSelector/someEvent",
					to: "some other state"
				}
			]
		},
		{
			state: "some other state",
			on: [
				event: ".aCSSSelector/someEvent/orSomeMore/events",
				to: "name of the state"
			]
		}
	]
}
</code></pre>

The "event" field *may* be any string. If the "event" field is a CSS selector, you may bind to one or more DOM events by using a "/" separated list. IE, "#someButton/click", or ".hotZone/mousein/mousemove".

## Managing a Machine

* <code>window.CState.add(machineGraph);</code> - the first state in the states array is the initial state of the machine.
* <code>window.CState.remove(machineName);</code>
* <code>window.CState.Machines[machineName].transition("eventTrigger");

## Styling a Machine
Use CSS selectors based on the data- attribute. For a machine named "demo", you can style elements using <code>[data-demo]</code> in your selectors.
<pre><code>
	div.menu[data-demo="open"] { display: inline-block; }
	div.menu[data-demo="closed"] { display: none; }
</code></pre>

* * *

Inspired by this [article](http://toddmotto.com/stop-toggling-classes-with-js-use-behaviour-driven-dom-manipulation-with-data-states/).