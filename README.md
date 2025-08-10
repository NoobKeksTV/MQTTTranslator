# MQTTTranslator

I wanted to have a Graph for the Temperatures (Shelly H&T gen 1 + 2) and Voltage / Power usage (Shellyy Plug, Shelly 3EM) so i made this.

The Shelly devices write their data to a MQTT Broker (Eclipse Mosquitto) and i read the data and write it to my InfluxDB to later plot it in Grafana.

Here are the final Graphs:
![Graphs](https://files.egopvp.com/u/EvF1U1.png)

See for yourself:
https://stats.egopvp.com/public-dashboards/ca0109aca75242ffb6d152f44e8e3fb1