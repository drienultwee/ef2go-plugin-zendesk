<template>
    <div class="row d-flex flex-row row">
        <div class="col">

            <!--            <button type="button" class="btn btn-sm btn-primary" @click="$store.dispatch('fetchRequests', { plugin: plugin })">Test</button>-->
            <!--            <button type="button" class="btn btn-sm btn-primary" @click="DEBUG = !DEBUG">Debug</button>-->
            <div v-if="DEBUG">
                <pre>{{ me }}</pre>
                <pre>{{ shared }}</pre>
                <pre>{{ users }}</pre>
            </div>

            <alert :message="alerts.could_not_connect" :type="'warning'" v-if="could_not_connect"></alert>

            <div v-if="!is_loading.me && shared.current_user.role === 'efcustomer'">
                <alert :message="alerts.account_wrong_role" :type="'warning'" v-if="me.role === 'end-user'"></alert>
                <alert :message="alerts.unverified" :type="'warning'" v-if="me.id && !me.verified"></alert>
            </div>

            <div v-if="!is_loading.me && shared.current_user.role === 'assigner'">
                <alert :message="alerts.unverified" :type="'warning'" v-if="me.id && !me.verified"></alert>
            </div>

            <div v-if="shared.current_user.role === 'efcustomer'">

                <div v-if="!create">

                    <card>
                        <h1>Recente tickets</h1>

                        <div class="loading-dark loading-dark--double" v-if="is_loading.tickets"></div>
                        <table class="table table-striped table-responsive table-hover" v-if="tickets.length > 0">
                            <thead>
                            <tr>
                                <th>Ticket onderwerp</th>
                                <th>Datum</th>
                                <th class="text-right"></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="ticket in tickets" :key="ticket.id" @click="showTicket(ticket.id)" class="pointer">
                                <td>{{ ticket.subject }}</td>
                                <td :title="ticket.created_at | datetime">{{ ticket.created_at | date }}</td>
                                <td class="text-right">
                                    <span class="badge" :class="{'badge-danger': ticket.type === 'incident'}">{{ ticket.type }}</span>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <div v-if="!is_loading.tickets && tickets.length < 1">
                            Geen tickets
                        </div>

                    </card>

                    <card v-if="is_loading.ticket">
                        <div class="loading-dark loading-dark--double"></div>
                    </card>
                    <card v-if="ticket && !is_loading.ticket">
                        <h2>Ticket</h2>
                        <div class="row">
                            <div class="col-md-8">
                                <strong>Onderwerp</strong>
                            </div>
                            <div class="col-md-4 text-right">
                                <span class="badge" :class="{'badge-danger': ticket.type === 'incident'}">{{ ticket.type }}</span>
                            </div>
                        </div>
                        <div class="row mb-15">
                            <div class="col-md-8">
                                {{ ticket.subject }}
                            </div>
                            <div class="col-md-4 d-flex justify-content-end">
                                <a :href="zendeskTicketUrl(ticket)" target="_blank">Open in Zendesk</a>
                            </div>
                        </div>

                        <div class="loading-dark loading-dark--double" v-if="is_loading.ticket_comments"></div>

                        <template v-if="!is_loading.ticket_comments">
                            <div class="row mb-15" v-for="comment in ticket_comments" :key="comment.id" style="max-height: 300px; overflow-y: auto" id="js-ticket-comments">
                                <div class="col-auto pr-0">
                                    <figure>
                                        <img :src="gravatar(users.find(u => u.id === comment.author_id).email)" class="img-circle img-fluid" style="max-width: 40px;">
                                    </figure>
                                </div>
                                <div class="col-md-11">
                                    <strong class="mb-10">{{ users.find(u => u.id === comment.author_id).name }}</strong>
                                    <div v-html="comment.html_body"></div>
                                    <hr>
                                </div>
                            </div>
                        </template>

                        <!--                <pre>{{ ticket.description }}</pre>-->
                        <!--                <button @click="react = !react" class="btn btn-sm btn-primary">Reageren</button>-->
                    </card>
                    <card v-if="ticket">
                        <reply></reply>
                    </card>


                </div>


            </div>

            <div v-if="shared.current_user.role === 'assigner'">
                <card>
                    <h1>Recente tickets</h1>

                    <button @click="$store.dispatch('toggleCreateRequest', {show: !create_request })" class="btn btn-primary mb-15">{{ create_request ? 'Annuleren' : 'Nieuw ticket'}}</button>
                    <create-request v-if="create_request"></create-request>

                    <div class="loading-dark loading-dark--double" v-if="is_loading.requests"></div>
                    <table class="table table-striped table-responsive table-hover" v-if="me.verified && !create_request">
                        <thead>
                        <tr>
                            <th>Ticket</th>
                            <th>Datum</th>
                            <th class="text-right"></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="request in requests" :key="request.id" @click="showRequest(request.id)" class="pointer">
                            <td>{{ request.subject }}</td>
                            <td :title="request.created_at | datetime">{{ request.created_at | date }}</td>
                            <td class="text-right">
                                <span class="badge" :class="{'badge-danger': request.type === 'incident'}">{{ request.type }}</span>
                            </td>
                        </tr>
                        <tr v-if="!is_loading.requests && requests.length < 1">
                            <td colspan="3">
                                Geen tickets
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </card>

                <card v-if="request && !create_request">

                    <div v-if="is_loading.request">
                        <div class="loading-dark loading-dark--double"></div>
                    </div>
                    <div v-if="!is_loading.request">

                        <div class="row" >
                            <div class="col-md-8">
                                <strong>Onderwerp</strong>
                            </div>
                            <div class="col-md-4 text-right">
                                <span class="badge" :class="{'badge-danger': request.type === 'incident'}">{{ request.type }}</span>
                            </div>
                        </div>
                        <div class="mb-15">{{ request.subject }}</div>

                    </div>

                    <div v-if="is_loading.request_comments">
                        <div class="loading-dark loading-dark--double"></div>
                    </div>
                    <div style="max-height: 300px; overflow-y: scroll" class="container" id="js-request-comments">

                        <div class="row mb-15" v-for="comment in request_comments" :key="comment.id">
                            <div class="col-auto pl-0 pr-0">
                                <figure>
                                    <img :src="gravatar(users.find(u => u.id === comment.author_id).email)" class="img-circle img-fluid" style="max-width: 40px;" v-if="users.find(u => u.id === comment.author_id)">
                                </figure>
                            </div>
                            <div class="col-md-10">
                                <strong class="mb-10">{{ users.find(u => u.id === comment.author_id).name }}</strong>
                                <div v-html="comment.html_body"></div>
                                <hr>
                            </div>
                        </div>

                    </div>

                    <!--                <pre>{{ ticket.description }}</pre>-->
                    <!--                <button @click="react = !react" class="btn btn-sm btn-primary">Reageren</button>-->
                </card>
                <card v-if="request && !create_request">
                    <reply></reply>
                </card>


            </div>

        </div>
<!--        <div class="col-6" v-if="shared.current_user.role === 'efcustomer' && ticket">-->

<!--            <card>-->
<!--                <h1>Relatie kaart</h1>-->
<!--                <p>In ontwikkeling</p>-->
<!--                &lt;!&ndash;                <p>{{ ticket }}</p>&ndash;&gt;-->
<!--                <p v-if="users.length > 0 && users.find(u => u.id === ticket.requester_id)">-->
<!--                    <strong>Relatie</strong>: {{ users.find(u => u.id === ticket.requester_id).name }}-->
<!--                    <br>-->
<!--                    <strong>E-mail</strong>: {{ users.find(u => u.id === ticket.requester_id).email }}-->
<!--                    <br>-->
<!--                </p>-->
<!--            </card>-->

<!--        </div>-->
    </div>

</template>

<script>
import { md5 } from "./utils/md5";
import { mapGetters } from 'vuex';
import CreateRequest from "./components/CreateRequest";
import Alert from "./components/Alert";
import Card from "./templates/Card";
import Reply from "./components/Reply";
import store from "./vuex/store";
import * as dayjs from 'dayjs'

export default {
    store,
    components: { CreateRequest, Reply, Alert, Card },
    data() {
        return {
            DEBUG: false,
            create: false,
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
            // me: {
            //     id: null,
            //     verified: true,
            // },
            // ticket: null,
            // tickets: [],
            // request: null,
            // request_comments: [],
            // comments: [],
            // users: [],
            react: false,
            apicaller: 'https://gerbendev.302.nl/account/apicaller/zendesk',
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
        }
        this.is_loading.me = false;

        console.log('this.me: ', this.me);

        if(this.me.id && this.me.verified) {

            if(this.shared.current_user.role === 'assigner') {

                // await this.fetchRequests();
                await this.$store.dispatch('fetchRequests')

                if(localStorage.plugins_zendesk_last_opened_request_id) {
                    let plugins_zendesk_last_opened_request_id = JSON.parse(localStorage.plugins_zendesk_last_opened_request_id);
                    this.showRequest(plugins_zendesk_last_opened_request_id);
                }
            }

            if(this.shared.current_user.role === 'efcustomer') {
                this.is_loading.tickets = true;
                await this.$store.dispatch('fetchTickets', { plugin: this.plugin })
                this.is_loading.tickets = false;

                if(localStorage.plugins_zendesk_last_opened_ticket_id) {
                    let plugins_zendesk_last_opened_ticket_id = JSON.parse(localStorage.plugins_zendesk_last_opened_ticket_id);
                    this.showTicket(plugins_zendesk_last_opened_ticket_id);
                }

            }

        }


        if(localStorage.concept_comment) {
            this.reply = JSON.parse(localStorage.concept_comment);
        }

        if(localStorage.concept_newticket) {
            this.newticket = JSON.parse(localStorage.concept_newticket);
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
    methods: {
        async createTicket(){
            // create
            if(this.shared.current_user.role === 'efcustomer') {
                // create ticket
            }
        },
        gravatar(email = ''){
            return 'https://secure.gravatar.com/avatar/'+md5(email ?? '')+'?d=mp';
        },
        async showTicket(ticket_id) {
            localStorage.plugins_zendesk_last_opened_ticket_id = JSON.stringify(ticket_id);

            this.is_loading.ticket = true;
            await this.$store.dispatch('fetchTicket', { ticket_id, plugin: this.plugin });
            this.is_loading.ticket = false;

            console.log('we got a ticket', this.ticket, ticket_id);

            this.is_loading.ticket_comments = true;
            await this.$store.dispatch('fetchTicketComments', { ticket: this.ticket, plugin: this.plugin })
            this.is_loading.ticket_comments = false;

            this.scrollToBottom("js-ticket-comments");
        },
        async showRequest(request_id) {
            localStorage.plugins_zendesk_last_opened_request_id = JSON.stringify(request_id);

            this.is_loading.request = true;

            try {
                await this.$store.dispatch('fetchRequest', { request_id, plugin: this.plugin });
            } catch(ex) {
                alert('error occured while fetching request');
                console.log('error occured while fetching request', ex);
            }
            this.is_loading.request = false;

            this.is_loading.request_comments = true;
            try {
                await this.$store.dispatch('fetchRequestComments', { request: this.request, plugin: this.plugin });
                // await this.fetchRequestComments(request_id);
            } catch(ex) {
                alert('error occured while fetching requests');
                console.log('error occured while fetching requests', ex);
            }
            this.is_loading.request_comments = false;

            this.scrollToBottom("js-request-comments");
        },
        scrollToBottom(element) {
            this.$nextTick(() => {
                let commentsContainer = document.getElementById(element);

                commentsContainer.scrollTop = commentsContainer.scrollHeight;
            });
        },
        zendeskTicketUrl(ticket){
            console.log('zendesk tickt url', this.plugin);
            return 'https://'+this.plugin.settings.zendeskurl + '.zendesk.com/agent/tickets/'+ticket.id;
        }

    },
    computed: {
        ...mapGetters([
            'me',
            'plugin',
            'request',
            'request_comments',
            'requests',
            'ticket',
            'ticket_comments',
            'tickets',
            'users',
            'shared',
            'create_request'
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
