<template>
    <div>
        <card>
            <h2>Recente tickets</h2>

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
                    <a :href="ticketUrl(ticket)" target="_blank">Open in Zendesk</a>
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
            <reply-to-ticket></reply-to-ticket>
        </card>

    </div>
</template>
<script>
import { scrollToBottomByElementId } from "../utils/scrollToBottom";
import { gravatar } from "../utils/gravatar";
import Card from '../templates/Card';
import ReplyToTicket from './ReplyToTicket';
import {mapGetters} from "vuex";
import * as dayjs from "dayjs";

export default {
    components: { Card, ReplyToTicket },
    async mounted(){

        if(this.me.role === 'end-user') {
            this.$store.commit('addWarning', { warning: { message: 'Uw bent niet als \'agent\' bekend bij Zendesk.'}});
            return ;
        }

        this.is_loading.tickets = true;

        if(this.shared.relation) {
            await this.$store.dispatch('fetchTicketsForRelation', { plugin: this.plugin });
        } else {
            await this.$store.dispatch('fetchTickets', { plugin: this.plugin });
        }

        this.is_loading.tickets = false;

        // if(localStorage.plugins_zendesk_last_opened_ticket_id) {
        //     const last_opened_ticket_id = JSON.parse(localStorage.plugins_zendesk_last_opened_ticket_id);
        //     await this.showTicket(last_opened_ticket_id);
        // }

    },
    data() {
        return {
            is_loading: {
                ticket: false,
                tickets: false,
                ticket_comments: false,
            }
        }
    },
    methods: {
        gravatar,
        async showTicket(ticket_id) {
            localStorage.plugins_zendesk_last_opened_ticket_id = JSON.stringify(ticket_id);

            this.is_loading.ticket = true;
            await this.$store.dispatch('fetchTicket', { ticket_id, plugin: this.plugin });
            this.is_loading.ticket = false;

            console.log('we got a ticket', this.ticket, ticket_id);

            this.is_loading.ticket_comments = true;
            await this.$store.dispatch('fetchTicketComments', { ticket: this.ticket, plugin: this.plugin })
            this.is_loading.ticket_comments = false;

            this.$nextTick(() => {
                scrollToBottomByElementId("js-ticket-comments");
            });

        },
        ticketUrl(ticket){
            return 'https://'+this.plugin.settings.zendeskurl + '.zendesk.com/agent/tickets/'+ticket.id;
        }
    },
    computed: {
        ...mapGetters([
            'me',
            'plugin',
            'ticket',
            'ticket_comments',
            'tickets',
            'users',
            'shared',
        ]),
        getTicketsForRelation() {
            return this.tickets;
        },
    },
    filters: {
        date(date, format = 'D-M-YYYY') {
            return dayjs(date).format(format);
        },
        datetime(date, format = 'D-M-YYYY HH:mm:ss'){
            return dayjs(date).format(format);
        }
    },
}
</script>
