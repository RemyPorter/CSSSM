CSSSM
=====

# The CSS State Machine

The purpose of this code is to allow web designers to define a declarative state machine for UI behaviors. This is currently "proof-of-concept" status. A simple declarative style allows for the linking of UI elements to states and events. This makes it easy to build *behavior* into web interfaces without writing code.

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
======

Inspired by this [article](http://toddmotto.com/stop-toggling-classes-with-js-use-behaviour-driven-dom-manipulation-with-data-states/).