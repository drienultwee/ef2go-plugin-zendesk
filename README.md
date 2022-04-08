# ef2go-plugin-zendesk

Met behulp van "Vue CLI" is eenvoudig een development omgeving op te zetten zodat men meteen kan beginnen om een plugin te bouwen.

Deze Zendesk DEMO plugin is gebouwd met de volgende libraries: VueJS, VueX, Axios, Lodash, dayjs.

De development omgeving draait standaard op localhost, poort 8081.

SSL staat standaard aan (selfsigned certificate). Dit omdat http resources op https omgevingen standaard door de browser geblokkeert worden. (Mixed Content).

In het EF2GO dashboard:

Ga naar de ZENDESK plugin.
Gebruik vervolgens https://localhost:8081/js/app.js als jouw Plugin JS url.

Ga naar het Beheer - plugins. Vul bij de Plugin instellingen, de volgende instellingen aan:
- token (API key van Zendesk)
- zendeskurl (Subdomein van Zendesk)

De benodigde settings, endpoints en headers van de plugin staan voor deze Zendesk DEMO al ingesteld.

## Zendesk API keys
Ga naar:
```
https://<uw-zendesk>.zendesk.com/admin/home
```
Klik door naar
```
Apps en integraties --> API's - Zendesk-API
```

## Development setup

Installeer @vue/cli globaal volgens de Vue CLI documentatie:
```
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```



## Extra info
vue.config.js

### Development poort veranderen:


Voeg port aan devServer toe.
```
module.exports = {
    devServer: {
        ...
        port: 1337
        ...
    }
}
```

### Disable Host Check

Voor Hot Reloading (refreshing) wordt een websocket gebruikt. Aangezien jouw JS file op een andere host wordt gebruikt. Lukt het niet om een websocket verbinding op te zetten en zal hot reloading niet werken.

```
disableHostCheck: true
```

### Split chunks false
Standaard worden dependencies in een apart js file weggeschreven.

Door de volgende instelling in de vue.config.js wordt jouw plugin als een bestand gecompiled.
```
chainWebpack: config => {
    config.optimization.splitChunks(false);
}
```
