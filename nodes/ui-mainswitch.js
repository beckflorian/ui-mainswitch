const statestore = require('/data/data/com.termux/files/home/.node-red/node_modules/@flowfuse/node-red-dashboard/nodes/store/state.js')

const TIMER_UNDEF = null
const TIMER_ON = true
const TIMER_OFF = false

const INPUT_UNDEF = null
const INPUT_ON = true
const INPUT_OFF = false

const AUTO_UNDEF = null
const AUTO_ON = true
const AUTO_OFF = false

const OUT_ON = true
const OUT_OFF = false

const TIMER_RUNNING = true
const TIMER_NOT_RUNNING = false


module.exports = function (RED) {
  function UIMainswitchNode (config) {
    RED.nodes.createNode(this, config)

    // which group are we rendering this widget
    const group = RED.nodes.getNode(config.group)
    const base = group.getBase()

    this.topicOut = config.topicOut
    this.topicFeedback = config.topicFeedback
    this.topicAuto = config.topicAuto

    var node = this
    var context = this.context()
    var timerNextEvent = {}
    var status = {
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
    }


    function checkWeekdays(days, now, weekday, day, hours, minutes, state) {
      var dates = []
      // for every day
      days.forEach(function (d, j) {
        var date = new Date()
        var dateDay = day - weekday + j
        date.setDate(dateDay)
        date.setSeconds(0)
        date.setMilliseconds(0)
        date.setHours(parseInt(hours))
        date.setMinutes(parseInt(minutes))
        if (date < now) date.setDate(dateDay + 7)
        if (d == true) dates.push({ time: date, state: state }) //only if weekdayday is checked
      })
      return dates
    }


    function nextTakePlace(events) {
      const now = new Date()
      const weekday = now.getDay()
      const day = parseInt(
        Intl.DateTimeFormat('de-DE', { day: 'numeric' }).format(now)
      )
      var ntp = []
      // for every event
      events.forEach(function (e, i) {
        if (e.active === true) { // event active?
          var startH = parseInt(e.startTime.split(':')[0])
          var startM = parseInt(e.startTime.split(':')[1])
          var endH = parseInt(e.duration.split(':')[0]) + startH
          var endM = parseInt(e.duration.split(':')[1]) + startM
          // generating "On" Times
          ntp = ntp.concat(
            checkWeekdays(e.day, now, weekday, day, startH, startM, true)
          )
          // generating "Off" Times
          ntp = ntp.concat(
            checkWeekdays(e.day, now, weekday, day, endH, endM, false)
          )
        }
      })
      if (ntp.length == 0) {
        return [null, false]
      } else {
        var orderNtp = ntp.sort(function (a, b) {
          return Date.parse(a.time) - Date.parse(b.time)
        })
        return orderNtp[0]
      }
    }


    function ticker (sta) {
      var now = new Date()
      if (sta.countdownSec >= 0) { // Countdown active?
        if (sta.countdownSec == 0) { // Countdown run down?
          status.mainSwitch = switchTo // set to default
          //updateStatus()
          stateMachine()
        }
        status.countdownSec = sta.countdownSec - 1
      }
      if (timerNextEvent['time'] < now) {
        status.auto = timerNextEvent['state']
        status.timerIn = timerNextEvent['state']
        status.lastSetter = "timer"
        updateEvents()
        stateMachine()
      }
      //console.info(timerNextEvent)
      if (timerNextEvent['time']) {
        status.timerNextEventSec = Math.floor((timerNextEvent['time'] - now) / 1000)
        status.timerNextEventState = timerNextEvent['state']
        status.timerRunning = TIMER_RUNNING
      } else {
        status.timerNextEventSec = null
        status.timerRunning = TIMER_NOT_RUNNING
      }
      updateStatus()
    }

    var tick = setInterval(ticker, 1000, status)

    function updateStatus() { // update widget
      base.emit('updateStatus:' + node.id, { payload: status }, node)
    }

    function updateEvents() {
      timerNextEvent = nextTakePlace(status.events)
    }

    function mainswitchOut(out) {
      if (node.topicOut !== "") {
        node.send({
          payload: out,
          topic: node.topicOut
        })
      } else {
        node.send({
          payload: out
        })
      }
    }

    function stateMachine() {
      switch (status.mainSwitch) {
        case 0:
          mainswitchOut(OUT_OFF)
          status.countdownSec = -1 // reset Countdown (potentially)
          break
        case 1:
          mainswitchOut(OUT_ON)
          status.countdownSec = -1 // reset Coundown (potentially)
          break
        case 2:
          if (status.auto === AUTO_ON) {
            mainswitchOut(OUT_ON)
          } else {
            mainswitchOut(OUT_OFF)
          }
          status.countdownSec = -1 // reset Countdown (potentially)
          break
        case 3:
          mainswitchOut(OUT_ON)
          break
        default:
          mainswitchOut(OUT_OFF)
      }
    }

    function parseBool(input) {
      const INPUT_PARSER = {
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
      }
      if (input in INPUT_PARSER) {
        return INPUT_PARSER[input]
      } else {
        return INPUT_NOT_SET
      }
    }

    status.events = context.get('events') || []
    updateEvents()

    if (config.switchTo == 2) { // check for default values
       var switchTo = 2
       status.switchToText = 'Auto'
    } else {
       var switchTo = 0
       status.switchToText = 'Off'
    }



    // server-side event handlers
    const evts = {
      onAction: true,
      onInput: function (msg, send, done) {
        console.info(msg)
        if (msg.topic == "") {
          //status.feedback = parseBool(msg.payload)
          //updateStatus()
        }
        if (node.topicFeedback != "" && msg.topic == node.topicFeedback) {
          status.feedback = parseBool(msg.payload)
          updateStatus()
        }
        if (node.topicAuto != "" && msg.topic == node.topicAuto) {
          status.auto = parseBool(msg.payload)
          status.autoIn = parseBool(msg.payload)
          status.lastSetter = "autoIn"
          updateStatus()
          stateMachine()
        }
      },
      onSocket: {
        'downMainswitch': function (conn, id, msg) {
          console.info('"downMainswitch" received:', conn.id, id, msg)
          if (msg.payload == 3 && status.interval !== undefined){
            status.countdownSec = status.intervalSecs
          }
          status.mainSwitch = msg.payload
          updateStatus()
          stateMachine()
        },
        'downInterval': function (conn, id, msg) {
          console.info('"downInterval" received:', conn.id, id, msg)
          status.interval = msg.payload
          status.intervalSecs = msg.secs
          updateStatus()
        },
        'downEvents': function (conn, id, msg) {
          console.info('"downEvents" received:', conn.id, id, msg)
          status.events = msg.payload
          context.set('events', status.events)
          updateEvents()
          updateStatus()
        },
        'update-status': function (conn, id, msg) {
          console.info('"update-status" received:', conn.id, id)
          updateStatus()
        }
      },
      onClose: function () {
        if (tick) { clearIntervall(tick); }
        done()
      }
    }
    // inform the dashboard UI that we are adding this node
    if (group) {
      group.register(node, config, evts)
    } else {
      node.error('No group configured')
    }
  }

  RED.nodes.registerType('ui-mainswitch', UIMainswitchNode)
}
