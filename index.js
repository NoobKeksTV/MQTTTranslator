const { InfluxDB, Point } = require('@influxdata/influxdb-client')
const mqtt = require('mqtt')
const protocol = process.env.MQttProtocol
const host = process.env.MQttHost
const port = process.env.MQttPort
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}`

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQttName,
    password: process.env.MQttPW,
    reconnectPeriod: 1000,
})



const url = process.env.InfluxUrl;
const token = process.env.InfluxToken;


const influxDB = new InfluxDB({ url, token })
const writeApi = influxDB.getWriteApi(process.env.InfluxORG, process.env.InfluxBUCKET)


writeApi.useDefaultTags({ shelly: 'flood' })

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})

client.on('connect', () => {
    console.log('Connected to mqtt')
    client.subscribe('shellies/shellyflood-01792F/sensor/temperature');
    client.subscribe('shellies/shellyflood-01792F/sensor/battery');
    client.subscribe('shellies/shellyflood-01792F/sensor/flood');
    client.subscribe('shellies/shellyplusplugs-e86beae833c0/status/switch:0');

    client.subscribe('shellies/shellyhtg3-e4b32332ea9c/status/temperature:0');// Thermostat Lars
    client.subscribe('shellies/shellyhtg3-e4b32332ea9c/status/humidity:0');
    client.subscribe('shellies/shellyhtg3-e4b32332ea9c/status/devicepower:0');

    client.subscribe('shellies/shellyhtg3-e4b32330b5a8/status/temperature:0'); // Thermostat Außen
    client.subscribe('shellies/shellyhtg3-e4b32330b5a8/status/humidity:0');
    client.subscribe('shellies/shellyhtg3-e4b32330b5a8/status/devicepower:0');

    client.subscribe('shellies/shellyht-679C9C/sensor/temperature'); // Thermostat WZ
    client.subscribe('shellies/shellyht-679C9C/sensor/humidity');
    client.subscribe('shellies/shellyht-679C9C/sensor/battery');

    client.subscribe('shellies/shellyht-FBE6F9/sensor/temperature'); // Thermostat Flur
    client.subscribe('shellies/shellyht-FBE6F9/sensor/humidity');
    client.subscribe('shellies/shellyht-FBE6F9/sensor/battery');

    client.subscribe('shellies/shellyem3-483FDAC3E12C/emeter/0/voltage'); // Stromzähler
    client.subscribe('shellies/shellyem3-483FDAC3E12C/emeter/1/voltage'); // Stromzähler
    client.subscribe('shellies/shellyem3-483FDAC3E12C/emeter/2/voltage'); // Stromzähler
})

client.on('message', (topic, payload) => {

    if(payload){
    if(payload === null || payload == "null" || !payload || payload == null){
        console.log("Value ist null aber kein crash! - TOPIC: " + topic.toString())
    }else{

        // Stromzähler
        if (topic == "shellies/shellyem3-483FDAC3E12C/emeter/0/voltage") {
        console.log('tried to write voltage1', payload.toString())

        const point1 = new Point('voltage').tag('sensor_id', 'Shelly3EM_P1').floatField('value', payload)
        writeApi.writePoint(point1)
    }
    if (topic == "shellies/shellyem3-483FDAC3E12C/emeter/1/voltage") {
        console.log('tried to write voltage2', payload.toString())

        const point1 = new Point('voltage').tag('sensor_id', 'Shelly3EM_P2').floatField('value', payload)
        writeApi.writePoint(point1)
    }
    if (topic == "shellies/shellyem3-483FDAC3E12C/emeter/2/voltage") {
        console.log('tried to write voltage3', payload.toString())

        const point1 = new Point('voltage').tag('sensor_id', 'Shelly3EM_P3').floatField('value', payload)
        writeApi.writePoint(point1)
    }
    
    // Flood Kellertüre
    if (topic == "shellies/shellyflood-01792F/sensor/temperature") {

        console.log('tried to write temp', payload.toString())

        const point1 = new Point('temp')
            .tag('sensor_id', 'ShellyFlood1')
            .floatField('value', payload)

        writeApi.writePoint(point1)
    }

    if (topic == "shellies/shellyflood-01792F/sensor/battery") {
        console.log('tried to write bat', payload.toString())

        const point1 = new Point('battery')
            .tag('sensor_id', 'ShellyFlood1')
            .floatField('value', payload)

        writeApi.writePoint(point1)
    }

    if (topic == "shellies/shellyflood-01792F/sensor/flood") {
        console.log('tried to write flood', payload.toString())

        if (payload == "true") {
            payload = 1
        } else {
            payload = 0
        }

        const point1 = new Point('flood').tag('sensor_id', 'ShellyFlood1').floatField('value', payload)
        writeApi.writePoint(point1)
    }

    // Switch
    if (topic == "shellies/shellyplusplugs-e86beae833c0/status/switch:0") {
        console.log('tried to write switch-data')

        const resp = JSON.parse(payload.toString());
        const active = resp.output;

        if (resp.voltage != 0) {
            const point3 = new Point('voltage').tag('sensor_id', 'ShellyPlug1').floatField('value', resp.voltage)
            writeApi.writePoint(point3)
        }


        const point1 = new Point('wattage').tag('sensor_id', 'ShellyPlug1').floatField('value', resp.apower)
        const point2 = new Point('active').tag('sensor_id', 'ShellyPlug1').floatField('value', 0 + active)

        const point4 = new Point('current').tag('sensor_id', 'ShellyPlug1').floatField('value', resp.current)

        writeApi.writePoint(point1)
        writeApi.writePoint(point2)

        writeApi.writePoint(point4)

    }

    // Temp Lars
    if (topic == "shellies/shellyhtg3-e4b32332ea9c/status/temperature:0") {
        console.log("schreibe temp daten - Lars")

        const resp = JSON.parse(payload.toString());
        payload = resp.tC;

        const point1 = new Point('temp').tag('sensor_id', 'ShellyTempLars').floatField('value', payload)

        writeApi.writePoint(point1)
    }
    if (topic == "shellies/shellyhtg3-e4b32332ea9c/status/humidity:0") {
        console.log("schreibe humid daten - Lars")

        const resp = JSON.parse(payload.toString());
        payload = resp.rh;

        const point1 = new Point('humidity').tag('sensor_id', 'ShellyTempLars').floatField('value', payload)

        writeApi.writePoint(point1)
    }
    if (topic == "shellies/shellyhtg3-e4b32332ea9c/status/devicepower:0") {
        console.log("schreibe power daten - Lars")

        const resp = JSON.parse(payload.toString());
        payload = resp.battery.percent;

        const point1 = new Point('battery').tag('sensor_id', 'ShellyTempLars').floatField('value', payload)

        writeApi.writePoint(point1)
    }
    // Temp Außen
    if (topic == "shellies/shellyhtg3-e4b32330b5a8/status/temperature:0") {
        console.log("schreibe temp daten - außen")

        const resp = JSON.parse(payload.toString());
        payload = resp.tC;

        const point1 = new Point('temp').tag('sensor_id', 'ShellyTempAußen').floatField('value', payload)

        writeApi.writePoint(point1)
    }
    if (topic == "shellies/shellyhtg3-e4b32330b5a8/status/humidity:0") {
        console.log("schreibe humid daten - außen")

        const resp = JSON.parse(payload.toString());
        payload = resp.rh;

        const point1 = new Point('humidity').tag('sensor_id', 'ShellyTempAußen').floatField('value', payload)

        writeApi.writePoint(point1)
    }
    if (topic == "shellies/shellyhtg3-e4b32330b5a8/status/devicepower:0") {
        console.log("schreibe power daten - außen")

        const resp = JSON.parse(payload.toString());
        payload = resp.battery.percent;

        const point1 = new Point('battery').tag('sensor_id', 'ShellyTempAußen').floatField('value', payload)

        writeApi.writePoint(point1)
    }

    // Temp WZ
    if (topic == "shellies/shellyht-679C9C/sensor/temperature") {
        console.log("schreibe temp daten - wz")


        const point1 = new Point('temp').tag('sensor_id', 'ShellyTempWZ').floatField('value', payload)

        writeApi.writePoint(point1)
    }
    if (topic == "shellies/shellyht-679C9C/sensor/humidity") {
        console.log("schreibe humid daten - wz")

       

        const point1 = new Point('humidity').tag('sensor_id', 'ShellyTempWZ').floatField('value', payload)

        writeApi.writePoint(point1)
    }
    if (topic == "shellies/shellyht-679C9C/sensor/battery") {
        console.log("schreibe power daten - wz")

        
        const point1 = new Point('battery').tag('sensor_id', 'ShellyTempWZ').floatField('value', payload)

        writeApi.writePoint(point1)
    }

    // Temp Flur

     if (topic == "shellies/shellyht-FBE6F9/sensor/temperature") {
        console.log("schreibe temp daten - flur")

       
        const point1 = new Point('temp').tag('sensor_id', 'ShellyTempFlur').floatField('value', payload)

        writeApi.writePoint(point1)
    }
    if (topic == "shellies/shellyht-FBE6F9/sensor/humidity") {
        console.log("schreibe humid daten - flur")

      
        const point1 = new Point('humidity').tag('sensor_id', 'ShellyTempFlur').floatField('value', payload)

        writeApi.writePoint(point1)
    }
    if (topic == "shellies/shellyht-FBE6F9/sensor/battery") {
        console.log("schreibe power daten - flur")

     

        const point1 = new Point('battery').tag('sensor_id', 'ShellyTempFlur').floatField('value', payload)

        writeApi.writePoint(point1)
    }}
}
})
