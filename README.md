# 4-state-switch-node for node-red with integrated Dashboard 2.0 widget.

### Inputs
#### *MainSwitch*
: payload (string [0..3, off, on, auto, countdown]) : set the 'state' of the MainSwitch.

: *topic* (string) : empty/no topic.

#### *Interval*
: payload (string [0..28]) : set the 'interval' for the countdown in 29 steps (4 seconds to 72 hours).

: *topic* (string) : 'interval'

#### *Feedback*
: payload (string [true, false, 0, 1, on, off, On, Off, ON, OFF]) : set the 'feedback' of your actuator. The background-color of the Feedback-Label changes according to this input.

: *topic* (string) : set the topic in the editor.

#### *AutoIn*
: payload (string [true, false, 0, 1, on, off, On, Off, ON, OFF]) : set the 'autoInState' of the node. If 'mainSwitchState' is "auto" this will activate or inactivate the output.

: *topic* (string) : set the topic in the editor.

### Outputs
#### *MainSwitch*
: payload (string [true, false]) : output of MainSwitch.

: *topic* (string) : empty/set the topic in the editor.

### Details

#### *The four states are:*
- "Off": outputs "false".
- "On": outputs "true".
- "Auto": outputs "true" or "false" depending on the last "autoIn" input state and the integrated timer.
- "Countdown": outputs "true". After a selectable time outputs "false".


#### *Purpose:*
The switch is designed for integrating manual switching and auto-features e.g.
- Switching the power of an audio amp depending on the state of the api of an audio device...
- Switching pumps/valves of a swimmingpool or garden watering system depending on schedule, weather forecast or water level...


#### *Features:*
The node/widget integrates some interesting features:
- Display for feedback from the actuator.
- "autoIn": input for an external signal to change the output, when the switch is on "Auto".
- Integrated Timer to schedule events with starting time, duration and weekday selection, when the switch is on "Auto".
- Integrated countdown to manually activate the output for a selectable time, independent from timer and autoIn.
- Topics for "autoIn", "Feedback" and "output" are customizable.
- Icon and Label for "Feedback"/"Switchname" is customizable.
- Colors are customizable.
- Language/Labels are customizable.

#### *Data retention:*
It is recommended to set the contextStorage to "localfilesystem" in 'settings.js' if you want do keep the state of the switch and the events of the timer when stopping/restarting node-red.

### Customizing the node in the editor

#### *Name:*
Name of the node diplayed in the editor.

#### *Group:*
Group the widget renders in the Dashboard 2.0

#### *Size:*
Size of the widget, if you use a grid layout.

#### *Switch Label:*
Label for the switch. The color of this label changes with the state of the "feedback" input from your acuator.

#### *Feedback Icon :*
Icon for the switch label. The color of this label/icon changes with the state of the "feedback" input from your acuator.

#### *Feddback Topic:*
Specify a topic for your feedback input. "Feedback" input accepts a boolean payload (true, false, 1, 0, On, Off...).

#### *Auto Topic:*
If you specify an Auto Topic, the "autoIn" input is active. "autoIn" input accepts a boolean payload (true, false, 1, 0, On, Off...).

#### *Auto Label:*
Label for "autoIn". The color of this label changes with the state of the "autoIn" input.

#### *Output Topic:*
If you specify an output topic, the output messge will have this topic. Otherwise the topic is empty.

#### *Colors:*
In the editor you can customize the color settings by declaring an json-object - complete or partial - like this:
```
{
    "expansionPanelTitle":"pink",
    "mainSwitch":[
        "red-darken-1",
        "green-darken-1",
        "blue-darken-1",
        "black","white"
    ],
    "mainSwitchAuto":{
        "false":{
            "false":"red-darken-1",
            "true":"green-darken-1",
            "null":"grey-darken-1"
        },
        "true":{
            "false":"red-lighten-3",
            " true":"green-lighten-3",
            "null":"grey-lighten-2"
        }
    },
    "autoIn":{
        "false":"light-blue-lighten-3",
        "true":"yellow-lighten-2"
    },
    "timerIn":{
        "false":"light-blue-lighten-3",
        "true":"yellow-lighten-2"
    },
    "feedback":{
        "false":"red-darken-1",
        "true":"green-darken-1",
        "null":"grey-darken-1"
    },
    "countdown":"deep-purple",
    "eventToolbar":"amber",
    "slider":"amber",
    "plus":"red",
    "activeActive":"green",
    "activeInactive":"red"
}
```

#### *Language:*
In the editor you can customize the language settings by declaring an json-object - complete or partial - like this:
```
{
    "events":"Events",
    "start":"Start",
    "duration":"Duration",
    "actions":"Actions",
    "active":"active",
    "inactive":"inactive",
    "activeLabel":"Active?",
    "until":"until",
    "off":"Off",
    "auto":"Auto",
    "dayLabels":["Su","Mo","Tu","We","Th","Fr","Sa"],
    "dayOrder":[0,1,2,3,4,5,6],
    "newEvent":"New Event",
    "editEvent":"Edit Event",
    "cancel":"Cancel",
    "ok":"OK",
    "deleteConfirm":"Do you really want to delete this event?",
    "noData":"No event yet..."
}
```

### References

 - [GitHub](https://github.com/beckflorian/ui-mainswitch) - the nodes github repository

### Disclaimer:
Of course, this software is completely opensource and offered with absolutely NO WARRANTY whatsoever offered or implied.

If you choose to set up your own control system for actuators, and your house burns to the ground, it's your problem, nothing to do with this software as there is no warranty whatsoever. Up to you to use it completely at your own risk. So YOU HAVE BEEN WARNED!
