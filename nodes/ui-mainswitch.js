const statestore = require('/data/data/com.termux/files/home/.node-red/node_modules/@flowfuse/node-red-dashboard/nodes/store/state.js')

module.exports = function (RED) {
    function UIMainswitchNode (config) {
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        const base = group.getBase()

        this.topicFeedback = config.topicFeedback
        this.topicAuto = config.topicAuto
        this.keppSecs = 140

        var node = this

        var status = {
          mainSwitch: 0,
          interval: 14,
          intervalSecs: 1200,
          auto: 'ud',
          feedback: 'ud',
          timerSec: -1,
          switchToText: 'Off'
        }

        if (config.switchTo == 2) { // check for default values
           var switchTo = 2
           status.switchToText = 'Auto'
        } else {
           var switchTo = 0
        }

        function ticker (sta) {
          //console.info(sta) 
          if (sta.timerSec >= 0) { // Timer active?
            if (sta.timerSec == 0) { // Timer run down?
              status.mainSwitch = switchTo // set to default
              updateStatus()
              stateMachine()
            }
            status.timerSec = sta.timerSec -1
            updateStatus()
          }
        }

        var tick = setInterval(ticker, 1000, status)

        function updateStatus() { // update widget
          base.emit('updateStatus:' + node.id, { payload: status }, node)
        }

        function mainswitchOut(out) {
          node.send({
            payload: out,
            topic: 'topicOut'
          })
          //updateStatus()
        }

        function stateMachine() {
          switch (status.mainSwitch) {
            case 0:
              mainswitchOut(false)
              status.timerSec = 0 // reset Timer (potentially)
              break
            case 1:
              mainswitchOut(true)
              break
            case 2:
              if (status.auto == 'on') {
                mainswitchOut(true)
              } else {
                mainswitchOut(false)
              }
              break
            case 3:
              mainswitchOut(true)
              break
            default:
              mainswitchOut(false)
          }
        }


        function parseBool(x) {
          switch (x) {
            case 'off':
            case false:
              return 'off'
              break
            case 'on':
            case true:
              return 'on'
              break
            default:
              return 'ud'
          }
        }


        // server-side event handlers
        const evts = {
            onAction: true,
            onInput: function (msg, send, done) {
              //console.info(msg)
              if (
                msg.topic == "" || (
                  node.topicFeedback != "" &&
                  msg.topic == node.topicFeedback)
                ) {
                status.feedback = parseBool(msg.payload)
                updateStatus()
              }
              if (
                node.topicAuto != "" &&
                msg.topic == node.topicAuto
                ) {
                status.auto = parseBool(msg.payload)
                updateStatus()
                stateMachine()
              }
            },
            onSocket: {
                'downMainswitch': function (conn, id, msg) {
                    console.info('"downMainswitch" received:', conn.id, id, msg)
                    if (msg.payload == 3 && status.interval !== undefined){
                      status.timerSec = status.intervalSecs
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
                'update-status': function (conn, id, msg) {
                    console.info('"update-status" received:', conn.id, id)
                    updateStatus()
                }
            },
            onClose: function () {
              if (tick) { clearIntervall(tick); }
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
