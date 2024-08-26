<template>
  <!-- Component must be wrapped in a block so props such as className and style can be passed in from parent -->
  <div className="ui-mainswitch-wrapper">
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title class="pa-2">
          <v-row no-gutters>
            <v-col cols="auto">
              <v-chip
                class="ma-1 rounded"
                :color="feedbackColor"
                prepend-icon="mdi-hydro-power"
                density="compact"
                size="x-large"
                variant="outlined"
              >
                {{props.switchLabel}}
              </v-chip>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
              <v-chip
                class="ma-1 rounded"
                :color="autoColor"
                prepend-icon="mdi-import"
                density="compact"
                variant="outlined"
                size="x-large"
              >
                {{props.autoLabel}}
              </v-chip>
            </v-col>
          </v-row>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="auto">
              <v-btn-toggle
                v-model="status.mainSwitch"
                @update:modelValue="updateMainswitch()"
                class="pa-1"
                mandatory
                variant="outlined"
                divided
                rounded="l"
                color="blue"
              >
                <v-btn>
                  <v-icon size="x-large" :color="colorScheme['off']"
                    >mdi-fan-off</v-icon
                  >
                </v-btn>
                <v-btn>
                  <v-icon size="x-large" :color="colorScheme['on']"
                    >mdi-fan</v-icon
                  >
                </v-btn>
                <v-btn>
                  <v-icon size="x-large" :color="colorScheme['auto']"
                    >mdi-fan-auto</v-icon
                  >
                </v-btn>
                <v-btn :color="colorScheme['man']"> {{ showInterval }} </v-btn>
              </v-btn-toggle>
            </v-col>
            <v-spacer></v-spacer>
            <v-col>
              <v-slider
                max="27"
                show-ticks
                step="1"
                tick-size="1"
                v-model="status.interval"
                @update:modelValue="updateInterval()"
                prepend-icon="mdi-clock-time-four"
                min-width="20em"
                max-width="40em"
                density="compact"
                thumb-size="10"
                :readonly="readOnlySlider"
                class="pa-2"
              ></v-slider>{{timerSek}}
            </v-col>
          </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>


        <h1>Example Integrated Widget: {{ id }}</h1>

        <!-- Note: We can use any Vuetify Components by default -->
        <h2>Using Vuetify Components</h2>
        <p>
            <a href="https://vuetifyjs.com/en/components/all/#containment" target="_blank">Vuetify</a> is included by default, so we can include any of their components.
            Here we have a button that will open a "Hello World" alert:
        </p>
        <pre>&lt;v-btn @click="alert('Hello World')"&gt;Alert "Hello World"&lt;/v-btn&gt;</pre>
        <v-btn @click="alert('Hello World')">Alert "Hello World"</v-btn>

        <h2>Accessing Properties</h2>
        <p>
            Your Vue component will be rendered and passed a few built-in properties.
        </p>

        <h3><code>this.id</code></h3>
        <p>Each widget has a unique ID, which can be used when sending messages to Node-RED via <code>this.$socket.emit()</code>.</p>
        <pre>{{ id }}</pre>

        <h3><code>this.props</code></h3>
        <p>The <code>props</code> object contains the properties defined in the widget's configuration in Node-RED.</p>
        <pre>{{ props }}</pre>

        <h3><code>this.status</code></h3>
        <p>The <code>status</code> object contains the properties defined in the widget's configuration in Node-RED.</p>
        <pre>{{ status }}</pre>

        <h3><code>this.state</code></h3>
        <p>
            The <code>state</code> object contains the current visibility &amp; behavioural state of the widget,
            including whether it is enabled and visible. This is not yet fully functionality in Dashboard 2.0,
            but will be expanded in future.
        </p>
        <pre>{{ state }}</pre>

        <h2>Communications with Node-RED</h2>
        <p>Events are sent back and forth between Node-RED and Dashboard 2.0 with SocketIO</p>
        <h3>Sending Node-RED Messages</h3>
        <p>You can send and receive the built-in events, as well as defining your own:</p>
        <v-btn @click="send({payload: 'Hello World'})">Send msg</v-btn>
        <h3>Sending Custom SocketIO Events</h3>
        <p>
            You can also send custom events, which can be handled by a custom event handler in Node-RED.
            The Node-RED-side's handler should have <code>(conn, id, msg)</code> as the input variables.
        </p>
        <v-btn @click="test()">Send 'my-custom-event'</v-btn>

        <h2>Data Retention &amp; VueX Stores</h2>
        <p>Dashboard 2.0 has a built-in VueX datastore. This can be used to store (and retrieve) the latest received messages.</p>
        <p>Note: the vuex store is cleared on refresh of a screen, at which point, data will be loaded from the Node-RED datastore, should it be present.</p>
        <p>Send a message to this node in order to see the value here:</p>
        <pre>{{ messages && messages[id] ? messages[id] : 'No Data' }}</pre>
        <p>Note that it persists, even after refresh. This is because, in our <code>onInput</code> event handler in our <code>ui-mainswitch.js</code> file, we store the message in the Node-RED datastore.</p>

        <!-- Note: We can use any Vuetify Components by default -->
        <h2>Styling with Vuetify &amp; CSS</h2>
        <p>
            We can define our own CSS within the widget's repository,
            and expose classes like <code class="ui-mainswitch-class">ui-mainswitch-class</code>
        </p>
        <p>
            Vuetify also comes with a handful of utility classes to assist with styling:
            <ul>
                <li v-for="guide in vuetifyStyles" :key="guide.label"><a :href="guide.url" target="_blank">{{ guide.label }}</a></li>
            </ul>
        </p>

        <h2>External Dependencies</h2>
        <p>
            Any additional libraries you require can be installed as in any other package.
            When the <code>npm run build</code> command is run, Vite will package everything
            up into the single <code>.umd.js</code> file.
        </p>
        <p>
            Here, we include the NPM package <code>to-title-case</code>, and bind it's
            functionality to a VueJS Computed Variable, which automatically re-calculates.
        </p>
        <p>
            <v-text-field v-model="input.title" type="text" />
            VueJS Computed Variable Output: <i>{{ titleCase }}</i>
        </p>
    </div>
</template>

<script>
import toTitleCase from 'to-title-case'
import { markRaw } from 'vue'
import { mapState } from 'vuex'

export default {
  name: 'UIMainswitch',
  inject: ['$socket'],
  props: {
    /* do not remove entries from this - Dashboard's Layout Manager's will pass this data to your component */
    id: { type: String, required: true },
    props: { type: Object, default: () => ({}) },
    state: { type: Object, default: () => ({ enabled: false, visible: false }) }
  },
  setup (props) {
    console.info('UIMainswitch setup with:', props)
    console.debug('Vue function loaded correctly', markRaw)
  },
  data () {
    return {
      input: {
        title: 'some text here will base turned into title case.'
      },
      vuetifyStyles: [
        { label: 'Responsive Displays', url: 'https://vuetifyjs.com/en/styles/display/#display' },
        { label: 'Flex', url: 'https://vuetifyjs.com/en/styles/flex/' },
        { label: 'Spacing', url: 'https://vuetifyjs.com/en/styles/spacing/#how-it-works' },
        { label: 'Text & Typography', url: 'https://vuetifyjs.com/en/styles/text-and-typography/#typography' }
      ],
      tickIntervals: [ { secs: 4, text: "4\"" }, { secs: 7, text: "7\"" }, { secs: 10, text: "10\"" }, { secs: 15, text: "15\"" }, { secs: 20, text: "20\"" }, { secs: 30, text: "30\"" }, { secs: 40, text: "40\"" }, { secs: 50, text: "50\"" }, { secs: 60, text: "1'" }, { secs: 120, text: "2'" }, { secs: 240, text: "4'" }, { secs: 420, text: "7'" }, { secs: 600, text: "10'" }, { secs: 900, text: "15'" }, { secs: 1200, text: "20'" }, { secs: 1800, text: "30'" }, { secs: 2400, text: "40'" }, { secs: 3000, text: "50'" }, { secs: 3600, text: "60'" }, { secs: 5400, text: "90'" }, { secs: 7200, text: '2h' }, { secs: 14400, text: '4h' }, { secs: 21600, text: '6h' }, { secs: 28800, text: '8h' }, { secs: 43200, text: '12h' }, { secs: 64800, text: '18h' }, { secs: 86400, text: '24h' }, { secs: 172800, text: '48h' }, ],
      actionColors : {
        on: 'green',
        off: 'red',
        ud: 'grey'
      },
      statusColors : {
        on: 'yellow-darken-2',
        off: 'light-blue-accent-3',
        ud: 'grey'
      },
      colorScheme: {
        on: 'green',
        off: 'red',
        auto: 'blue',
        man: 'black',
        bg: 'grey-lighten-4',
        bga: 'grey-lighten-2',
        autoOn: 'yellow-darken-2',
        autoOff: 'light-blue-accent-3',
      },
      mainSwitchStates: ['on', 'off', 'auto', 'man'],
      autoColor: 'grey',
      status: {
        mainSwitch: 0,
        interval: 14,
        feedback: 'ud',
        auto: 'ud' 
     }
    }
  },

  computed: {
    titleCase () {
      return toTitleCase(this.input.title)
    },
    showInterval() {
      return this.tickIntervals[this.status.interval]['text']
    },
    readOnlySlider() {
      return (this.status.mainSwitch == 3)
    },
    feedbackColor() {
      return this.actionColors[this.status.feedback]
    },
    autoColor() {
      return this.statusColors[this.status.auto]
    },
    ...mapState('data', ['messages'])
  },

   mounted () {
        this.$socket.on('widget-load:' + this.id, (msg) => {
            // load the latest message from the Node-RED datastore when this widget is loaded
            // storing it in our vuex store so that we have it saved as we navigate around
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
        })
        this.$socket.on('msg-input:' + this.id, (msg) => {
            // store the latest message in our client-side vuex store when we receive a new message
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
        })
        this.$socket.on('mainswitchOut:' + this.id, (msg) => {
          console.log(msg.payload)
          if (msg.payload) {
            this.mainLabelColor = this.colorScheme['on']
          } else {
            this.mainLabelColor = this.colorScheme['off']
          }            
        })
        this.$socket.on('feedback:' + this.id, (msg) => {
          this.feedbackColor = this.colorScheme[msg.payload]
          console.log(msg.payload)
        })
        this.$socket.on('auto:' + this.id, (msg) => {
          this.autoColor = this.colorScheme[msg.payload]
          console.log(msg.payload)
        })
        this.$socket.on('upMainswitch:' + this.id, (msg) => {
          this.mainswitch = msg.payload
          console.log('upMainswitch: ' +  msg.payload)
        })
        this.$socket.on('upTimer:' + this.id, (msg) => {
          this.timerSek = msg.payload
          console.log('upTimer: ' +  msg.payload)
        })
        this.$socket.on('updateStatus:' + this.id, (msg) => {
          this.status = msg.payload
          console.log('updateStatus: ' +  msg.payload)
        })
        // tell Node-RED that we're loading a new instance of this widget
        this.$socket.emit('widget-load', this.id)
        // request update of status
        this.$socket.emit('update-status', this.id)
    },
    unmounted () {
        /* Make sure, any events you subscribe to on SocketIO are unsubscribed to here */
        this.$socket?.off('widget-load:' + this.id)
        this.$socket?.off('msg-input:' + this.id)
        this.$socket?.off('mainswitchOut:' + this.id)
        this.$socket?.off('feedback:' + this.id)
        this.$socket?.off('auto:' + this.id)
        this.$socket?.off('upMainswitch:' + this.id)
        this.$socket?.off('upTimer:' + this.id)
    },
    methods: {
        /*
            widget-action just sends a msg to Node-RED, it does not store the msg state server-side
            alternatively, you can use widget-change, which will also store the msg in the Node's datastore
        */
        send (msg) {
            this.$socket.emit('widget-action', this.id, msg)
        },
        alert (text) {
            alert(text)
        },
        tester () {
          alert(this.mainswitch)
        },
        /*
            You can also emit custom events to Node-RED, which can be handled by a custom event handler
            See the ui-mainswitch.js file for how to subscribe to these.
        */
        updateMainswitch(){
          console.info('downMainswitch: ' + this.status.mainSwitch)
          this.$socket.emit('downMainswitch', this.id, { payload: this.status.mainSwitch })
        },
        updateInterval(){
          console.info('downInterval: ' + { payload: this.status.intervall, secs: this.tickIntervals[this.status.interval]['secs'] })
          this.$socket.emit('downInterval', this.id, { payload: this.status.interval, secs: this.tickIntervals[this.status.interval]['secs'] })
        },

        test () {
            console.info('custom event handler:')
            this.$socket.emit('my-custom-event', this.id, {
                payload: 'Custom Event'
            })
        }
    }
}
</script>

<style scoped>
/* CSS is auto scoped, but using named classes is still recommended */
@import "../stylesheets/ui-mainswitch.css";
</style>
