4-state-switch-node for node-red with integrated Dashboard 2.0 widget.
======================================================================

The four states are:
- "Off": outputs "false".
- "On": outputs "true".
- "Auto": outputs "true" or "false" depending on the last "autoIn" input state and the integrated timer.
- "Countdown": outputs "true". After a selectable time outputs "false".

The node integrates some interesting features:
- Display for feedback from the actuator.
- "autoIn": input for a signal to externaly change the output, when the switch is on "Auto".
- Integrated Timer to schedule events with starting time, duration and weekday selection, when the switch is on "Auto".
- Integrated countdown to activate the output for a selectable time, independent from timer and autoIn.
- Colors ar customizable.
- Language is customizable.
- Topics for "autoIn", "Feedback" and "output" are customizable.
- Icon for "Feedback" is customizable
