module.exports = function (RED) {
    function UIMainswitchNode (config) {
        RED.nodes.createNode(this, config);


        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group);
        const base = group.getBase();


        // states
        const TIMER_UNDEF = null;
        const TIMER_ON = true;
        const TIMER_OFF = false;

        const INPUT_UNDEF = null;
        const INPUT_ON = true;
        const INPUT_OFF = false;

        const AUTO_UNDEF = null;
        const AUTO_ON = true;
        const AUTO_OFF = false;

        const OUT_ON = true;
        const OUT_OFF = false;

        const TIMER_RUNNING = true;
        const TIMER_NOT_RUNNING = false;


        // Parser for boolean Input
        const BOOL_INPUT_PARSER = {
            true: INPUT_ON,
            false: INPUT_OFF,
            'true': INPUT_ON,
            'false': INPUT_OFF,
            'TRUE': INPUT_ON,
            'FALSE': INPUT_OFF,
            0: INPUT_OFF,
            1: INPUT_ON,
            'On': INPUT_ON,
            'Off': INPUT_OFF,
            'on': INPUT_ON,
            'off': INPUT_OFF,
            'ON': INPUT_ON,
            'OFF': INPUT_OFF,
            null: INPUT_UNDEF,
            'null': INPUT_UNDEF,
            'NULL': INPUT_UNDEF
        };


        // Parser for MainSwitch Input
        const MAIN_INPUT_PARSER = {
            0: 0,
            1: 1,
            2: 2,
            3: 3,
            'OFF': 0,
            'Off': 0,
            'off': 0,
            'ON': 1,
            'On': 1,
            'on': 1,
            'AUTO': 2,
            'Auto': 2,
            'auto': 2,
            'COUNTDOWN': 3,
            'Countdown': 3,
            'countdown': 3
        };


        // intervals for countdown in secs and text
        const TICK_INTERVAL = [
            { secs: 4, text: "4\"" },
            { secs: 7, text: "7\"" },
            { secs: 10, text: "10\"" },
            { secs: 15, text: "15\"" },
            { secs: 20, text: "20\"" },
            { secs: 30, text: "30\"" },
            { secs: 40, text: "40\"" },
            { secs: 50, text: "50\"" },
            { secs: 60, text: "1'" },
            { secs: 120, text: "2'" },
            { secs: 240, text: "4'" },
            { secs: 420, text: "7'" },
            { secs: 600, text: "10'" },
            { secs: 900, text: "15'" },
            { secs: 1200, text: "20'" },
            { secs: 1800, text: "30'" },
            { secs: 2400, text: "40'" },
            { secs: 3000, text: "50'" },
            { secs: 3600, text: "60'" },
            { secs: 5400, text: "90'" },
            { secs: 7200, text: '2h' },
            { secs: 14400, text: '4h' },
            { secs: 21600, text: '6h' },
            { secs: 28800, text: '8h' },
            { secs: 43200, text: '12h' },
            { secs: 64800, text: '18h' },
            { secs: 86400, text: '24h' },
            { secs: 172800, text: '48h' },
            { secs: 259200, text: '72h' },
        ];


        // default colors
        const COLORS = {
            expansionPanelTitle: 'pink',
            mainSwitch: ['red-darken-1', 'green-darken-1', 'blue-darken-1', 'black', 'white'],
            mainSwitchAuto: {
                false: {false: 'red-darken-1', true: 'green-darken-1', null: 'grey-darken-1'},
                true: {false: 'red-lighten-3', true: 'green-lighten-3', null: 'grey-lighten-2'}
            },
            inhibition: ['brown-lighten-3', 'purple', 'grey'],
            inhibitionToolbar: 'blue-lighten-3',
            measurements: ['light-blue-lighten-3'],
            autoIn: {false: 'light-blue-lighten-3', true: 'yellow-lighten-2'},
            timerIn: {false: 'light-blue-lighten-3', true: 'yellow-lighten-2'},
            feedback: {false: 'red-darken-1', true: 'green-darken-1', null: 'grey-darken-1'},
            countdown: 'deep-purple',
            eventToolbar: 'amber',
            slider: 'amber',
            plus: 'red',
            activeActive: 'green',
            activeInactive: 'red',
        };


        // helper function for calculating, on what weekday and what time an event occurs
        function checkWeekdays(days, now, weekday, day, hours, minutes, state) {
            var dates = []; // one item per day

            // for every day
            days.forEach(function (d, j) {
                var date = new Date();
                var dateDay = day - weekday + j;
                date.setDate(dateDay);
                date.setSeconds(0);
                date.setMilliseconds(0);
                date.setHours(parseInt(hours));
                date.setMinutes(parseInt(minutes));
                if (date < now) date.setDate(dateDay + 7)
                    if (d == true) dates.push({ time: date, state: state }) //only if weekdayday is checked
            });

            return dates;
        }

        // calculate the next event to take place in the timer
        function nextTakePlace(events) {
            const now = new Date();
            const weekday = now.getDay();
            const day = parseInt(
                Intl.DateTimeFormat('de-DE', { day: 'numeric' }).format(now)
            );

            var ntp = []; // one item per event and state (true/false)
            // for every event
            events.forEach(function (e, i) {
                if (e.active === true) { // event active?

                    // get start and end, hors and minutes
                    var startHour = parseInt(e.startTime.split(':')[0])
                    var startMinute = parseInt(e.startTime.split(':')[1])
                    var endHour = parseInt(e.duration.split(':')[0]) + startHour
                    var endMinute = parseInt(e.duration.split(':')[1]) + startMinute

                    // generating "On" Times
                    ntp = ntp.concat(
                        checkWeekdays(e.day, now, weekday, day, startHour, startMinute, true)
                    );

                    // generating "Off" Times
                    ntp = ntp.concat(
                        checkWeekdays(e.day, now, weekday, day, endHour, endMinute, false)
                    );
                }
            });

            if (ntp.length == 0) { // no events?
                return [null, false];
            } else {
                // get the next event
                var orderNtp = ntp.sort(function (a, b) {
                    return Date.parse(a.time) - Date.parse(b.time)
                });
                return orderNtp[0];
            }
        }


        // to be executed every second: countdown running? event occurring?
        function ticker (sta) {
            var now = new Date();

            // countdown
            if (sta.countdownSec >= 0) { // active?
                if (sta.countdownSec == 0) { // Countdown run down?
                    node.status.mainSwitch = node.lastMainSwitch; // set to last state before countdown
                    stateMachine();
                }
                node.status.countdownSec = sta.countdownSec - 1; // count down
            }

            // timer events
            if (node.timerNextEvent['time'] < now) { // event takes place?
                node.status.auto = node.timerNextEvent['state']; // set state
                node.status.timerIn = node.timerNextEvent['state'];
                node.status.lastSetter = "timer"; // who did set that state?
                updateEvents(); // generate next event
                stateMachine();
            }

            // calculate next time and state to display in widget
            if (node.timerNextEvent['time']) {
                node.status.timerNextEventSec = Math.floor((node.timerNextEvent['time'] - now) / 1000);
                node.status.timerNextEventState = node.timerNextEvent['state'];
                node.status.timerRunning = TIMER_RUNNING;
            } else { // no event
                node.status.timerNextEventSec = null;
                node.status.timerRunning = TIMER_NOT_RUNNING;
            }

            // send to widget
            updateStatus()
        }


        // send status to widget
        function updateStatus() { // update widget
            base.emit('updateStatus:' + node.id, { payload: node.status }, node);
        }


        // calculate the next occurence of a timer event
        function updateEvents() {
            node.timerNextEvent = nextTakePlace(node.status.events)
        }


        // manage some things when the mainSwitch state changes
        function setMainSwitch(input) {
            // countdown?
            if (input == 3 && node.status.interval !== undefined){
                node.status.countdownSec = node.status.intervalSecs;

                // preserv mainSwitch status for the next change from auto to ?
                if (node.status.mainSwitch == 2) {
                    node.lastMainSwitch = 2; 
                    node.status.switchToText = 'Auto';
                } else {
                    node.lastMainSwitch = 0;
                    node.status.switchToText = 'Off';
                }
            }

            node.status.mainSwitch = input;
            updateStatus();
            stateMachine();
        }


        // send output
        function mainswitchOut(out) {
            // output topic set?
            if (node.topicOut !== "") {
                node.send( {
                    payload: out,
                    topic: node.topicOut
                });
            } else {
                node.send({
                    payload: out
                });
            }
        }


        // bring the things together
        function stateMachine() {
            switch (node.status.mainSwitch) {
                case 0:
                    mainswitchOut(OUT_OFF);
                    node.status.countdownSec = -1; // reset Countdown (potentially)
                    break;
                case 1:
                    mainswitchOut(OUT_ON);
                    node.status.countdownSec = -1; // reset Coundown (potentially)
                    break;
                case 2:
                    if (node.status.auto === AUTO_ON) {
                        mainswitchOut(OUT_ON);
                    } else {
                        mainswitchOut(OUT_OFF);
                    }
                    node.status.countdownSec = -1; // reset Countdown (potentially)
                    break;
                case 3:
                    mainswitchOut(OUT_ON);
                    break;
                default: // only for prevention
                    mainswitchOut(OUT_OFF)
            }
        }


        // manage all potential inputs
        function parseBool(input) {
            if (input in BOOL_INPUT_PARSER) {
                return BOOL_INPUT_PARSER[input];
            } else {
                return INPUT_NOT_SET;
            }
        }


        // merge the default setting objects with the config from html
        function objectMerger(source, coloring) {
            // is the current layer an object/array or not?
            if (typeof(source) == 'object') {
                // ist the current layer an object or array?
                if (Array.isArray(source)) { // array
                    // something to replace?
                    if (coloring === undefined) {
                        return source;
                    } else {
                        var resultArray = [];
                        // walk through the elements of the array
                        source.forEach((el, i) => {
                            resultArray.push(objectMerger(source[i], coloring[i]));
                        });
                        return resultArray;
                    }
                } else { // object
                    var resultObject = {}
                    // walk through the elements of the object
                    for(var key in source){
                        if(source.hasOwnProperty(key)){
                            // something to replace?
                            if (coloring.hasOwnProperty(key)){
                                 resultObject[key] = objectMerger(source[key], coloring[key]);
                            } else {
                                 resultObject[key] = source[key];
                            }
                        }
                    }
                    return resultObject;
                }
            } else { // no object or array
                // something to replace?
                if (coloring !== undefined){
                    return coloring;
                } else {
                    return source;
                }
            }
        }


        // server-side event handlers
        const evts = {
            onAction: true,

            onInput: function (msg, send, done) {
                // without topic -> mainSwitch
                if (msg.topic == "") {
                    if (msg.payload in MAIN_INPUT_PARSER) { // parse all potential inputs
                        setMainSwitch(MAIN_INPUT_PARSER[msg.payload]);
                    }
                }

                // with topic "interval" -> set the intervall for the countdown
                if (msg.topic == "interval") {
                    var interval = parseInt(msg.payload);
                    if (interval >= 0 && interval <= TICK_INTERVAL.length) { // check the allouwed values
                        node.status.interval = interval;
                        //node.status.interval = TICK_INTERVAL[interval]['text'];
                        node.status.intervalSecs = TICK_INTERVAL[interval]['secs'];
                        updateStatus(); // to widget
                    }
                }

                // for feedback from actuator
                if (node.topicFeedback != "" && msg.topic == node.topicFeedback) {
                    node.status.feedback = parseBool(msg.payload);
                    updateStatus(); // to widget
                }

                // for autoIn
                if (node.topicAuto != "" && msg.topic == node.topicAuto) {
                    node.status.auto = parseBool(msg.payload); // for the stateMachine
                    node.status.autoIn = parseBool(msg.payload); // for the chip in the widget
                    node.status.lastSetter = "autoIn"; // highlight what input set auto
                    updateStatus(); // to widget
                    stateMachine(); // switch output?
                }
            },

            onSocket: {
                // widget sends change of mainSwitch
                'downMainswitch': function (conn, id, msg) {
                    // console.info('"downMainswitch" received:', conn.id, id, msg)
                    setMainSwitch(msg.payload);
                },

                // widget sends change of countdown interval
                'downInterval': function (conn, id, msg) {
                    // console.info('"downInterval" received:', conn.id, id, msg)
                    node.status.interval = msg.payload;
                    node.status.intervalSecs = msg.secs;
                    updateStatus(); // to widget
                },

                // widget sends changes from timer event form
                'downEvents': function (conn, id, msg) {
                    // console.info('"downEvents" received:', conn.id, id, msg)
                    node.status.events = msg.payload;
                    context.set('events', node.status.events); // store in context store
                    updateEvents();
                    updateStatus(); // to widget
                },

                // widget askes for actual status
                'update-status': function (conn, id, msg) {
                    // console.info('"update-status" received:', conn.id, id)
                    updateStatus() // to widget
                }
            }
        }


        // get config from html and prepare the node
        this.topicOut = config.topicOut;
        this.topicFeedback = config.topicFeedback;
        this.topicAuto = config.topicAuto;

        // variables for the node
        this.timerNextEvent = {};
        this.lastMainSwitch = 0;
        this.status = {
            mainSwitch: 0,
            interval: 14,
            intervalSecs: 1200,
            auto: AUTO_UNDEF,
            autoIn: INPUT_UNDEF,
            feedback: INPUT_UNDEF,
            countdownSec: -1,
            switchToText: 'Off',
            events: [],
            timerIn: TIMER_UNDEF,
            timerRunning: TIMER_NOT_RUNNING,
            timerNextEventSec: -1,
            timerNextEventState: false,
            lastSetter: ""
        };

        // extend config for the widget
        config.tickInterval = TICK_INTERVAL;
        config.colors = objectMerger(COLORS, JSON.parse(config.colorsCustom));
//        console.log(JSON.stringify(COLORS))


        // get context store
        var context = this.context();

        // this is the node
        var node = this;

        // load timer events from the context store
        node.status.events = context.get('events') || [];
        updateEvents();

        // run ticker every second
        var tick = setInterval(ticker, 1000, node.status);
        var tickID = tick[Symbol.toPrimitive]();

        // kill the ticker
        node.on("close", function () {
            if (tick) { clearIntervall(tickID); }
        });

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, evts);
        } else {
            node.error('No group configured');
        }
    }

    RED.nodes.registerType('ui-mainswitch', UIMainswitchNode);
}
