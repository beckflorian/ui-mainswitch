const statestore = require('/data/data/com.termux/files/home/.node-red/node_modules/@flowfuse/node-red-dashboard/nodes/store/state.js')

module.exports = function (RED) {
    function UIMainswitchNode (config) {
        RED.nodes.createNode(this, config)

/*        console.info(config)
        console.info(this)*/
        this.topicFeedback = config.topicFeedback
        this.topicAuto = config.topicAuto
        this.keppSecs = 140
        var timerSek = 0

        var status = {
          mainSwitch: 0,
          interval: 14,
          intervalSecs: 1200,
          auto: 'ud',
          feedback: 'ud',
          timerSec: -1
        }

        var timer = {}

        var node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        const base = group.getBase()

        var stateAuto = false
        var stateTimer = false

        //console.info(mainswitch)

  /*      function ticker () {
          if (timerSek >= 0) {
            if (timerSek == 0) {
              base.emit('upMainswitch:' + node.id, { payload: 0 }, node)
              mainswitch = 0
              stateMachine()
            }
            node.send({payload: 'timerSek: ' + timerSek})
            base.emit('upTimer:' + node.id, { payload: timerSek }, node)
            timerSek = timerSek - 1
          }
        }

        var tick = setInterval(ticker, 1000)
*/
        function updateStatus() { // update widget
          base.emit('updateStatus:' + node.id, { payload: status }, node)
        }

        function mainswitchOut(out) {
          node.send({
            payload: out,
            topic: 'topicOut'
          })
          updateStatus()
        }

        function stateMachine() {
          switch (status.mainSwitch) {
            case 0:
              mainswitchOut(false)
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
/*              if (msg.topic == node.topicAuto){
                switch (msg.payload) {
                  case 'off':
                  case false:
                    base.emit('auto:' + node.id, { payload: 'autoOff' }, node)
                    stateAuto = false
                    break
                  case 'on':
                  case true:
                    base.emit('auto:' + node.id, { payload: 'autoOn' }, node)
                    stateAuto = true
                    break
                  default:
                    base.emit('auto:' + node.id, { payload: 'undefined' }, node)
                    stateAuto = false
                }
              }
              // base.stores.data.save(base, node, msg)
              // console.info(msg)*/
            },
            onSocket: {
                'downMainswitch': function (conn, id, msg) {
                    console.info('"downMainswitch" received:', conn.id, id, msg)
                    if (msg.payload == 3 && status.interval !== undefined){
                      status.timerSec = status.intervalSecs
                    }
//                    base.emit('upMainswitch:' + node.id, { payload: msg.payload }, node)
                    status.mainSwitch = msg.payload
                    updateStatus()
                    stateMachine()
                },
                'downInterval': function (conn, id, msg) {
                    console.info('"downInterval" received:', conn.id, id, msg)
                    status.interval = msg.payload
                    status.intervalSecs = msg.secs
                    updateStatus()
//                    base.emit('updateStatus:' + node.id, { payload: status }, node)
                },
                'update-status': function (conn, id, msg) {
                    console.info('"update-status" received:', conn.id, id)
                    updateStatus()
//                    base.emit('updateStatus:' + node.id, { payload: status }, node)
//                    base.emit('updateStatus:' + node.id, { payload:{ 'hello': 'world'} }, node)
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
