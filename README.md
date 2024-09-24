# 4-state-switch-node for node-red with integrated Dashboard 2.0 widget.

### The four states are:
- "Off": outputs "false".
- "On": outputs "true".
- "Auto": outputs "true" or "false" depending on the last "autoIn" input state and the integrated timer.
- "Countdown": outputs "true". After a selectable time outputs "false".


### Purpose:
The switch is designed for integrating manual switching and auto-features e.g.
- Switching the power of an audio amp depending on the state of the api of an audio device...
- Switching pumps/valves of a swimmingpool or garde watering system depending on schedule, weather forecast or water level...


### Features
The node/widget integrates some interesting features:
- Display for feedback from the actuator.
- "autoIn": input for an external signal to change the output, when the switch is on "Auto".
- Integrated Timer to schedule events with starting time, duration and weekday selection, when the switch is on "Auto".
- Integrated countdown to activate the output for a selectable time, independent from timer and autoIn.
- Topics for "autoIn", "Feedback" and "output" are customizable.
- Icon and Label for "Feedback"/"Switchname" is customizable.
- Colors are customizable.
- Language/Labels are customizable.

## Customizing the node in the editor

### Name:
Name of the node diplayed in the editor.

### Group:
Group the widget renders in the Dashboard 2.0

### Size:
Size of the widget, if you use a grid layout.

### Switch Label (1):
Label for the switch. The color of this label changes with the state of the "feedback" input from your acuator.

### Feedback Icon (2):
Icon for the switch label. The color of this label/icon changes with the state of the "feedback" input from your acuator.

### Feddback Topic:
Specify a topic for your feedback input. "Feedback" input accepts a boolean payload (true, false, 1, 0, On, Off...).

### Auto Topic:
If you specify an Auto Topic, the "autoIn" input is active. "autoIn" input accepts a boolean payload (true, false, 1, 0, On, Off...).

### Auto Label(3):
Label for "autoIn". The color of this label changes with the state of the "autoIn" input.

### Output Topic:
If you specify an output topic, the output messge will have this topic. Otherwise the topic is empty.

### Colors:
In the editor you can customize the color settings by declaring an object - complete or partial - like this:
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
    "inhibition":[
        "brown-lighten-3",
        "purple","grey"
    ],
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

### Language:
In the editor you can customize the language settings by declaring an object - complete or partial - like this:
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
