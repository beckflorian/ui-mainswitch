<!--
check imports
-->
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
                {{secondsToTime('countdownSec')}} {{this.props.language.until}} {{condition.switchToText}}
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
                v-if="condition.timerRunning"
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
                v-model="condition.mainSwitch"
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
                :max="maxInterval"
                show-ticks
                step="1"
                tick-size="1"
                v-model="condition.interval"
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
              :items="condition.events"
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
                    {{this.props.language.events}}
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
                                :label="this.props.language.start"
                                v-model="editedItem.startTime"
                                :messages="startTimeErrorMessage"
                              >
                              </v-text-field>
                            </v-col>
                            <v-col cols="2" ma="2" pa="2" sm="6">
                              <v-text-field
                                type="time"
                                :label="this.props.language.duration"
                                v-model="editedItem.duration"
                                :messages="durationErrorMessage"
                              >
                              </v-text-field>
                            </v-col>
                            <v-col cols="2" md="4" sm="6">
                              <v-switch
                                :label="this.props.language.activeLabel"
                                color="green"
                                v-model="editedItem.active"
                              >
                              </v-switch>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-checkbox
                              v-for="i in this.props.language.dayOrder"
                              v-model="editedItem.day[i]"
                              :label="this.props.language.dayLabels[i]"
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
                          {{this.props.language.cancel}}
                        </v-btn>
                        <v-btn
                          color="blue-darken-1"
                          variant="text"
                          @click="save"
                        >
                          {{this.props.language.ok}}
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <v-dialog max-width="500px" v-model="dialogDelete">
                    <v-card>
                      <v-card-title class="text-h5"
                        >{{this.props.language.deleteConfirm}}
                      </v-card-title>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="blue-darken-1"
                          variant="text"
                          @click="closeDelete"
                          >{{this.props.language.cancel}}</v-btn
                        >
                        <v-btn
                          color="blue-darken-1"
                          @click="deleteItemConfirm"
                          variant="text"
                          >{{this.props.language.ok}}</v-btn
                        >
                        <v-spacer></v-spacer>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-toolbar>
              </template>
              <template
                v-for="i in this.props.language.dayOrder" 
                v-slot:[`item.day.${i}`]="{ item }">
                <v-checkbox-btn
                  v-model="item.day[i]"
                  density="compact"
                  readonly
                ></v-checkbox-btn>
              </template>
              <template v-slot:item.active="{ item }">
                <v-chip
                  :color="item.active ? colorPicker('activeActive') : colorPicker('activeInactive')"
                  :text="item.active ? this.props.language.active : this.props.language.inactive"
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
                {{this.props.language.noData}}
              </template>
            </v-data-table>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

<!--
    <v-row>
      <v-col>
        <v-sheet class="pa-4" color="grey-lighten-3">
          <pre>{{ props }}</pre>
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet class="pa-4" color="grey-lighten-3">
          <pre>{{ condition }}</pre>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-sheet class="pa-4" color="grey-lighten-3">
          <pre>{{ state }}</pre>
        </v-sheet>
      </v-col>
    </v-row>
-->
  </div>
</template>

<script>
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
            vuetifyStyles: [
                { label: 'Responsive Displays', url: 'https://vuetifyjs.com/en/styles/display/#display' },
                { label: 'Flex', url: 'https://vuetifyjs.com/en/styles/flex/' },
                { label: 'Spacing', url: 'https://vuetifyjs.com/en/styles/spacing/#how-it-works' },
                { label: 'Text & Typography', url: 'https://vuetifyjs.com/en/styles/text-and-typography/#typography' }
            ],
            startTimeErrorMessage: "",
            durationErrorMessage:"",
            dialog: false,
            dialogDelete: false,
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
            condition: {
                mainSwitch: 0,
                interval: 14,
                events: [],
                feedback: null,
                auto: null 
            }
        }
    },

    computed: {
        tableHeaders () {
            const headers = [
                { title: this.props.language.start, value: 'startTime', key: 'startTime' },
                { title: this.props.language.duration, value: 'duration' }
            ];
            this.props.language.dayOrder.forEach((e) => {
                headers.push(
                    {
                        title: this.props.language.dayLabels[e], 
                        value: 'day.' + e
                    }
                );
            });
            headers.push(
                { title: this.props.language.activeLabel, value: 'active' },
                { title: this.props.language.actions, value: 'actions', sortable: false }
            );
            return headers;
        },
        maxInterval () {
            return this.props.tickInterval.length - 1
        },
        formTitle() {
            return this.editedIndex === -1
              ? this.props.language.newEvent
              : this.props.language.editEvent
        },
        showInterval() {
            return this.props.tickInterval[this.condition.interval]['text']
        },
        readOnlySlider() {
            return (this.condition.mainSwitch == 3)
        },
        mainSwitchColor_2() {
            return this.props.colors.mainSwitchAuto[(this.condition.mainSwitch == 2)][this.condition.auto]
        },
        showCountdown() {
            return (this.condition.countdownSec >= 0)
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
        this.$socket.on('updateCondition:' + this.id, (msg) => {
          this.condition = msg.payload
          // console.debug('updateCondition: ' +  msg.payload)
        })
        // tell Node-RED that we're loading a new instance of this widget
        this.$socket.emit('widget-load', this.id)
        // request update of condition
        this.$socket.emit('update-condition' + this.condition.nodeId, this.id)
    },
    
    unmounted () {
        /* Make sure, any events you subscribe to on SocketIO are unsubscribed to here */
        this.$socket?.off('widget-load:' + this.id)
        this.$socket?.off('updateCondition:' + this.id)
    },
    
    methods: {
        send (msg) {
            this.$socket.emit('widget-action', this.id, msg)
        },
        mainSwitchColor(key) {
            return this.props.colors.mainSwitch[key]
        },
        mainSwitchColorX(key) {
            if (this.condition.mainSwitch == key) {
               return this.props.colors.mainSwitch[4]
            } else {
               return this.props.colors.mainSwitch[key]
            }
        },
        elevated(item) {
            return (item == this.condition.lastSetter)
        },
        secondsToTime(key) {
            let sec = 0
            if (this.condition[key] > 0) sec = this.condition[key]
                return `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(sec%60).padStart(2, '0')}`
        },
        colorPicker(key) {
            if (key in this.condition) {
                return this.props.colors[key][this.condition[key]] //dynamic
            } else {
              return this.props.colors[key] //static
            }
        },
        updateMainswitch(){
            console.info('downMainswitch: payload: ' + this.condition.mainSwitch)
            this.$socket.emit('downMainswitch' + this.id, this.id, { payload: this.condition.mainSwitch })
        },
        updateInterval(){
            console.info('downInterval: ' + { payload: this.condition.intervall, secs: this.props.tickInterval[this.condition.interval]['secs'] })
            this.$socket.emit('downInterval' + this.id, this.id, { payload: this.condition.interval, secs: this.props.tickInterval[this.condition.interval]['secs'] })
        },
        updateEvents(){
            console.info('downEvents: ' + this.condition.events )
            this.$socket.emit('downEvents' + this.id, this.id, {payload: this.condition.events })
        },
        editItem(item) {
            this.editedIndex = this.condition.events.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        deleteItem(item) {
            this.editedIndex = this.condition.events.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
        deleteItemConfirm() {
            this.condition.events.splice(this.editedIndex, 1)
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
                    Object.assign(this.condition.events[this.editedIndex], this.editedItem)
                } else {
                    this.condition.events.push(this.editedItem)
                }
                this.updateEvents()
                this.close()
            } 
        },
    }
}
</script>

<style scoped>
/* CSS is auto scoped, but using named classes is still recommended */
@import "../stylesheets/ui-mainswitch.css";
</style>
