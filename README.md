4-state-switch-node for node-red with integrated Dashboard 2.0 widget.
======================================================================

The four states are:
- "Off": outputs "false".
- "On": outputs "true".
- "Auto": outputs "true" or "false" depending on the last "autoIn" input state and the integrated timer.
- "Countdown": outputs "true". After a selectable time outputs "false".


Purpose: The switch is designed for integrating manual switching and auto-features e.g.
- Switching the power of an audio amp depending on the state of the api of an audio device...
- Switching pumps/valves of a swimmingpool or garde watering system depending on schedule, weather forecast or water level...


The node/widget integrates some interesting features:
- Display for feedback from the actuator.
- "autoIn": input for an external signal to change the output, when the switch is on "Auto".
- Integrated Timer to schedule events with starting time, duration and weekday selection, when the switch is on "Auto".
- Integrated countdown to activate the output for a selectable time, independent from timer and autoIn.
- Topics for "autoIn", "Feedback" and "output" are customizable.
- Icon and Label for "Feedback"/"Switchname" is customizable.
- Colors ar customizable.
- Language/Labels are customizable.
