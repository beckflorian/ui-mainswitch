<template>
  <!-- Component must be wrapped in a block so props such as className and style can be passed in from parent -->
  <div className="ui-mainswitch-wrapper">
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title class="pa-2" :color="colorPicker('expansionPanelTitle')">
          <v-row no-gutters align="center">
            <v-col cols="auto" justify="start">
              <v-chip
                class="ma-1 rounded"
                :color="colorPicker('feedback')"
                :prepend-icon="props.feedbackIcon"
                density="compact"
                elevation="2"
                size="large"
                variant="flat"
              >
                {{props.switchLabel}}
              </v-chip>
            </v-col>
            <v-col cols="auto" justify="start" v-if="showCountdown">
              <v-chip
                class="ma-1 rounded"
                :color="colorPicker('countdown')"
                density="compact"
                variant="flat"
                elevation="2"
                size="default"
                prepend-icon="mdi-timer-sand"
              >
                {{secondsToTime('countdownSec')}} bis {{status.switchToText}}
              </v-chip>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto" justify="end">
              <v-chip
                class="ma-1 rounded"
                :color="colorPicker('autoIn')"
                prepend-icon="mdi-import"
                density="compact"
                :elevation="elevated('autoIn') ? 7 : 2"
                variant="flat"
                size="default"
                v-if="props.topicAuto"
              >
                {{props.autoLabel}}
              </v-chip>
              <v-chip
                class="ma-1 rounded"
                :color="colorPicker('timerIn')"
                prepend-icon="mdi-timer-outline"
                density="compact"
                :elevation="elevated('timer') ? 7 : 2"
                variant="elevated"
                size="default"
                v-if="status.timerRunning"
              >
                {{secondsToTime('timerNextEventSec')}}
              </v-chip>
            </v-col>
          </v-row>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row align="center">
            <v-col cols="auto">
              <v-btn-toggle
                v-model="status.mainSwitch"
                @update:modelValue="updateMainswitch()"
                class=""
                mandatory
                variant="flat"
                divided
                rounded="l"
                size="small"
              >
                <v-btn :color="mainSwitchColor(0)">
                  <v-icon :color="mainSwitchColorX(0)"
                    >mdi-fan-off</v-icon
                  >
                </v-btn>
                <v-btn :color="mainSwitchColor(1)">
                  <v-icon :color="mainSwitchColorX(1)"
                    >mdi-fan</v-icon
                  >
                </v-btn>
                <v-btn :color="mainSwitchColor(2)">
                  <v-icon :color="mainSwitchColor_2"
                    >mdi-fan-auto</v-icon
                  >
                </v-btn>
                <v-btn :color="mainSwitchColor(3)"> {{ showInterval }} </v-btn>
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
                prepend-icon="mdi-timer-sand"
                min-width="20em"
                max-width="40em"
                density="compact"
                thumb-size="10"
                :readonly="readOnlySlider"
                :color="colorPicker('slider')"
                size="small"
                hide-details
              ></v-slider>{{timerSek}}
            </v-col>
          </v-row>
          <v-row>
            <v-data-table
              :headers="tableHeaders"
              :items="status.events"
              :sort-by="[{ key: 'startTime', order: 'asc' }]"
              density="compact"
              :hide-default-footer="true"
              md="4"
            >
              <template v-slot:top>
                <v-toolbar
                  elevated
                  density="compact"
                  :color="colorPicker('eventToolbar')"
                >
                  <v-toolbar-title>
                    <v-icon size="x-small">mdi-timer-outline</v-icon>
                    Events
                  </v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-dialog max-width="500px" v-model="dialog">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        class="mb-2"
                        :color="colorPicker('plus')"
                        v-bind="props"
                        icon="mdi-plus"
                      >
                      </v-btn>
                    </template>
                    <v-card variant="flat">
                      <v-card-title>
                        <span class="text-h5">{{ formTitle }}</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <v-row>
                            <v-col cols="4" ma="2" pa="2" sm="6">
                              <v-text-field
                                type="time"
                                label="Startzeit"
                                v-model="editedItem.startTime"
                                :messages="startTimeErrorMessage"
                              >
                              </v-text-field>
                            </v-col>
                            <v-col cols="2" ma="2" pa="2" sm="6">
                              <v-text-field
                                type="time"
                                label="Dauer"
                                v-model="editedItem.duration"
                                :messages="durationErrorMessage"
                              >
                              </v-text-field>
                            </v-col>
                            <v-col cols="2" md="4" sm="6">
                              <v-switch
                                label="Aktiv?"
                                color="green"
                                v-model="editedItem.active"
                              >
                              </v-switch>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-checkbox
                              v-model="editedItem.day[1]"
                              label="Mo"
                              hide-details
                              density="compact"
                            ></v-checkbox>
                            <v-checkbox
                              v-model="editedItem.day[2]"
                              label="Di"
                              hide-details
                            ></v-checkbox>
                            <v-checkbox
                              v-model="editedItem.day[3]"
                              label="Mi"
                              hide-details
                            ></v-checkbox>
                            <v-checkbox
                              v-model="editedItem.day[4]"
                              label="Do"
                              hide-details
                            ></v-checkbox>
                            <v-checkbox
                              v-model="editedItem.day[5]"
                              label="Fr"
                              hide-details
                            ></v-checkbox>
                            <v-checkbox
                              v-model="editedItem.day[6]"
                              label="Sa"
                              hide-details
                            ></v-checkbox>
                            <v-checkbox
                              v-model="editedItem.day[0]"
                              label="So"
                              hide-details
                            ></v-checkbox>
                          </v-row>
                        </v-container>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="blue-darken-1"
                          variant="text"
                          @click="close"
                        >
                          Abbrechen
                        </v-btn>
                        <v-btn
                          color="blue-darken-1"
                          variant="text"
                          @click="save"
                        >
                          OK
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <v-dialog max-width="500px" v-model="dialogDelete">
                    <v-card>
                      <v-card-title class="text-h5"
                        >Wollen Sie diese Ereignis wirklich
                        löschen?</v-card-title
                      >
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="blue-darken-1"
                          variant="text"
                          @click="closeDelete"
                          >Abbrechen</v-btn
                        >
                        <v-btn
                          color="blue-darken-1"
                          @click="deleteItemConfirm"
                          variant="text"
                          >OK</v-btn
                        >
                        <v-spacer></v-spacer>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-toolbar>
              </template>
              <template v-slot:item.day.0="{ item }">
                <v-checkbox-btn
                  v-model="item.day[0]"
                  density="compact"
                  readonly
                ></v-checkbox-btn>
              </template>
              <template v-slot:item.day.1="{ item }">
                <v-checkbox-btn
                  v-model="item.day[1]"
                  density="compact"
                  readonly
                ></v-checkbox-btn>
              </template>
              <template v-slot:item.day.2="{ item }">
                <v-checkbox-btn
                  v-model="item.day[2]"
                  density="compact"
                  readonly
                ></v-checkbox-btn>
              </template>
              <template v-slot:item.day.3="{ item }">
                <v-checkbox-btn
                  v-model="item.day[3]"
                  density="compact"
                  readonly
                ></v-checkbox-btn>
              </template>
              <template v-slot:item.day.4="{ item }">
                <v-checkbox-btn
                  v-model="item.day[4]"
                  density="compact"
                  readonly
                ></v-checkbox-btn>
              </template>
              <template v-slot:item.day.5="{ item }">
                <v-checkbox-btn
                  v-model="item.day[5]"
                  density="compact"
                  readonly
                ></v-checkbox-btn>
              </template>
              <template v-slot:item.day.6="{ item }">
                <v-checkbox-btn
                  v-model="item.day[6]"
                  density="compact"
                  readonly
                ></v-checkbox-btn>
              </template>
              <template v-slot:item.active="{ item }">
                <v-chip
                  :color="item.active ? colorPicker('activeActive') : colorPicker('activeInactive')"
                  :text="item.active ? 'Aktiv' : 'Inaktiv'"
                  class="text-uppercase"
                  size="small"
                  label
                ></v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon class="me-2" size="small" @click="editItem(item)">
                  mdi-pencil-outline
                </v-icon>
                <v-icon size="small" @click="deleteItem(item)">
                  mdi-delete-outline
                </v-icon>
              </template>
              <template v-slot:no-data>
                <v-btn color="primary" @click="initialize"> Reset </v-btn>
              </template>
            </v-data-table>
          </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
          {{startTimeErrorMessage}}{{durationErrorMessage}}

{{colorPicker('countdown')}} {{mainSwitchColor_2}}
        <pre>&lt;v-btn @click="alert('Hello World')"&gt;Alert "Hello World"&lt;/v-btn&gt;</pre>
        <v-btn @click="alert('Hello World')">Alert "Hello World"</v-btn>

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
      startTimeErrorMessage: "",
      durationErrorMessage:"",
      tickIntervals: [ { secs: 4, text: "4\"" }, { secs: 7, text: "7\"" }, { secs: 10, text: "10\"" }, { secs: 15, text: "15\"" }, { secs: 20, text: "20\"" }, { secs: 30, text: "30\"" }, { secs: 40, text: "40\"" }, { secs: 50, text: "50\"" }, { secs: 60, text: "1'" }, { secs: 120, text: "2'" }, { secs: 240, text: "4'" }, { secs: 420, text: "7'" }, { secs: 600, text: "10'" }, { secs: 900, text: "15'" }, { secs: 1200, text: "20'" }, { secs: 1800, text: "30'" }, { secs: 2400, text: "40'" }, { secs: 3000, text: "50'" }, { secs: 3600, text: "60'" }, { secs: 5400, text: "90'" }, { secs: 7200, text: '2h' }, { secs: 14400, text: '4h' }, { secs: 21600, text: '6h' }, { secs: 28800, text: '8h' }, { secs: 43200, text: '12h' }, { secs: 64800, text: '18h' }, { secs: 86400, text: '24h' }, { secs: 172800, text: '48h' }, ],
      colors: {
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
     },
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
      dialog: false,
      dialogDelete: false,
      tableHeaders: [
        { title: 'Start', value: 'startTime', key: 'startTime' },
        { title: 'Dauer', value: 'duration' },
        { title: 'Mo', value: 'day.1' },
        { title: 'Di', value: 'day.2' },
        { title: 'Mi', value: 'day.3' },
        { title: 'Do', value: 'day.4' },
        { title: 'Fr', value: 'day.5' },
        { title: 'Sa', value: 'day.6' },
        { title: 'So', value: 'day.0' },
        { title: 'Aktiv', value: 'active' },
        { title: 'Aktionen', value: 'actions', sortable: false },
      ],
      events: [],
      editedIndex: -1,
      editedItem: {
        startTime: '',
        duration: '',
        active: true,
        day: [true, true, true, true, true, true, true],
      },
      defaultItem: {
        startTime: '',
        duration: '',
        active: true,
        day: [true, true, true, true, true, true, true],
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
        events: [],
        feedback: 'ud',
        auto: 'ud' 
      },
      mainSwitchColors: ['red', 'green', 'blue', 'grey']
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
    mainSwitchColor_2() {
      return this.colors.mainSwitchAuto[(this.status.mainSwitch == 2)][this.status.auto]
    },
    showCountdown() {
      return (this.status.countdownSec >= 0)
    },
  ...mapState('data', ['messages'])
  },
    watch: {
      dialog(val) {
        val || this.close()
      },
      dialogDelete(val) {
        val || this.closeDelete()
      },
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
      mainSwitchColor(key) {
        return this.colors.mainSwitch[key]
      },
      mainSwitchColorX(key) {
        if (this.status.mainSwitch == key) {
          return this.colors.mainSwitch[4]
        } else {
          return this.colors.mainSwitch[key]
        }
      },
      elevated(item) {
        return (item == this.status.lastSetter)
      },
      secondsToTime(key) {
        console.log(this.status[key])
        var sec = 0
        if (this.status[key] > 0) sec = this.status[key]
        return `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(sec%60).padStart(2, '0')}`
      },
      colorPicker(key) {
        if (key in this.status) {
          return this.colors[key][this.status[key]] //dynamic
        } else {
          return this.colors[key] //static
        }
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
        updateEvents(){
          console.info('downEvents: ' + this.status.events )
          this.$socket.emit('downEvents', this.id, {payload: this.status.events })
        },
      editItem(item) {
        this.editedIndex = this.status.events.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem(item) {
        this.editedIndex = this.status.events.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },

      deleteItemConfirm() {
        this.status.events.splice(this.editedIndex, 1)
        this.updateEvents()
        this.closeDelete()
      },

      close() {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeDelete() {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      save() {
        if (!this.editedItem.startTime) {
          this.startTimeErrorMessage = 'Sie müssen eine Zeit eingeben.'
          this.durationErrorMessage = ''
        } else if (!this.editedItem.duration) {
          this.durationErrorMessage = 'Sie müssen eine Zeit eingeben.'
          this.startTimeErrorMessage = ''
        } else {
          this.startTimeErrorMessage = ''
          this.durationErrorMessage = ''
          if (this.editedIndex > -1) {
            Object.assign(this.status.events[this.editedIndex], this.editedItem)
          } else {
            this.status.events.push(this.editedItem)
          }
          this.updateEvents()
          this.close()
        } 
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

.v-expansion-panel-text {
  background-color: #F0F0F0;
}

</style>
