<template>
    <div class="row d-flex flex-row row">
        <div class="col">
            <alert :message="warning.message" :type="'warning'" v-for="(warning, index) in $store.state.warnings" :key="'warning-'+index"></alert>

            <div v-if="public_js_variables.current_user.role === 'efcustomer'">
                <tickets></tickets>
            </div>

            <div v-if="public_js_variables.current_user.role === 'assigner'">
                <requests></requests>
            </div>

        </div>
    </div>

</template>

<script>
import { mapGetters } from 'vuex';
import Alert from "./components/Alert";
import store from "./vuex/store";
import * as dayjs from 'dayjs'
import Tickets from "./components/Tickets";
import Requests from "./components/Requests";

export default {
    store,
    components: {Tickets, Alert, Requests },
    data() {
        return {
            DEBUG: false,
            could_not_connect: false,
            is_loading: {
                me: false,
                ticket: false,
                tickets: false,
                ticket_comments: false,
                request: false,
                requests: false,
                request_comments: false,
            },
            alerts: { // gp todo translaten
                account_wrong_role: 'Uw e-mailadres is niet bekend bij Zendesk als beheerder.',
                unverified: 'Uw e-mailadres dient bevestigd te worden bij Zendesk. Hierover heeft u een e-mail gekregen. Daarna kunt u hier uw ingestuurde vragen terugzien.',
                could_not_connect: 'Kan geen verbinding maken met zendesk. Kloppen de API gegevens?',
            }
        }
    },
    async mounted() {

        this.is_loading.me = true;
        try {
            await this.$store.dispatch('fetchMe', { plugin: this.plugin });
        } catch(ex) {

            console.log('we got connection exception', ex);
            this.could_not_connect = true;

            this.$store.commit('addWarning', { warning: { message: this.alerts.could_not_connect }});
        }
        this.is_loading.me = false;

        if(this.me.id && !this.me.verified) {
            this.$store.commit('addWarning', { warning: { message: this.alerts.unverified }});
        }

    },
    filters: {
        date(date, format = 'D-M-YYYY') {
            return dayjs(date).format(format);
        },
        datetime(date, format = 'D-M-YYYY HH:mm:ss'){
            return dayjs(date).format(format);
        }
    },
    computed: {
        ...mapGetters([
            'me',
            'plugin',
            'users',
            'shared',
            'relation',
            'public_js_variables'
        ])
    },
}

</script>
<style>
.white-space-pre-wrap {
    white-space: pre-wrap;
}

.img-circle {
    border-radius: 50%;
}
</style>
