import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

import * as mutation from './mutation-types';
import {COMMTYPE_EMAIL} from "../enums/commtype";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        me: {
            id: null,
            verified: null,
            role: null
        },
        is_creating_request: false,
        is_creating_ticket: false,
        request: null,
        request_comments: [],
        requests: [],
        tickets: [],
        ticket: null,
        ticket_comments: [],
        users: [],
        requester: null,
        plugin: window.plugins.zendesk, // todo gp: maybe get this 'natively' by a commit or the root storage,
        shared: window.shared,
        public_js_variables: window.public_js_variables,
        warnings: [],
    },
    mutations: {
        isCreatingTicket(state, { show }){
            state.is_creating_ticket = show;
        },
        setIsCreatingRequest(state, show){
            state.is_creating_request = show;
        },
        addWarning(state, { warning }){
            state.warnings.push(warning);
        },
        setWarnings(state, { warnings}){
            state.warnings = warnings;
        },
        [mutation.CREATE_REQUEST](state, { show }){
            state.is_creating_request = show;
        },
        [mutation.ME](state, { me }) {
            state.me = me;
        },
        [mutation.REQUEST](state, { request }) {
            state.request = request;
        },
        [mutation.REQUESTS](state, { requests }) {
            state.requests = requests;
        },
        [mutation.REQUEST_COMMENTS](state, { request_comments }){
            state.request_comments = request_comments;
        },
        [mutation.TICKETS](state, { tickets }) {
            state.tickets = tickets;
        },
        [mutation.TICKET](state, { ticket }){
            console.log('we committed a ticket: ', ticket);

            state.ticket = ticket;
        },
        [mutation.TICKET_COMMENTS](state, { ticket_comments }){
            state.ticket_comments = ticket_comments;
        },
        [mutation.USERS](state, { users }){
            state.users = users;
        }
    },
    actions: {
        toggleCreateRequest({ commit }, { show }){
            commit(mutation.CREATE_REQUEST, { show })
        },
        toggleIsCreatingTicket({ commit }, { show }){
            commit('isCreatingTicket', { show })
        },
        setIsCreatingRequest({ commit }, show){
            commit('setIsCreatingRequest', show);
        },
        async fetchMe({ commit }, { plugin }){
            console.log('fetching me', plugin.apicaller);

            const result = await axios.post(plugin.apicaller, {
                handle: 'users.me'
            });

            commit(mutation.ME, { me: result.data.user });
        },
        async fetchRequest({ commit }, { request_id, plugin }) {
            const result = await axios.post(plugin.apicaller, {
                handle: 'request.show',
                params: {
                    request_id: request_id,
                },
            });

            commit(mutation.REQUEST, { request: result.data.request });
        },
        async fetchRequests({ state, commit }) {

            const result = await axios.post(state.plugin.apicaller, {
                handle: 'requests'
            });

            console.log('fetched requests:', result.data.requests);

            commit(mutation.REQUESTS, { requests: result.data.requests })
        },
        async fetchTicketsForRelation({ state, commit }, { plugin }) {

            commit('setWarnings', { warnings: []});

            // get mail addresses associated with relation
            const mailaddresses = state.shared.relation.rl_bedrijfsgegevens_communicatie.item.filter(comm => comm.rl_bedrijfsgegevens_commtype === COMMTYPE_EMAIL);

            if(mailaddresses.length === 0) {
                commit('addWarning', { warning: { message: 'Er is geen e-mailadres bekend bij deze relatie' } });

                return ;
            }

            // get zendesk user id by relations mail address
            const email = mailaddresses[0].rl_bedrijfsgegevens_commwaarde;

            const zendeskRequesters = await axios.post(plugin.apicaller, {
                handle: 'search.users.by.email',
                params: {
                    email,
                }
            });

            if(zendeskRequesters.data.count === 0) {
                commit('addWarning', { warning: { message: 'E-mailadres '+ email + ' is niet bekend bij zendesk.'} });

                return ;
            }

            const results = await axios.post(plugin.apicaller, {
                handle: 'users.tickets.requested',
                params: {
                    user_id: zendeskRequesters.data.results[0].id
                }
            });

            commit(mutation.TICKETS, { tickets: results.data.tickets })

        },
        async fetchTickets({ commit }, { plugin }) {
            commit('setWarnings', { warnings: []});

            const results = await axios.post(plugin.apicaller, {
                handle: 'tickets'
            });

            commit(mutation.TICKETS, { tickets: results.data.tickets })
        },
        async fetchTicket({ commit }, { ticket_id, plugin }) {
            const result = await axios.post(plugin.apicaller, {
                handle: 'tickets.show',
                params: {
                    ticket_id,
                },
            });

            console.log('we fetched a ticket: ', result.data.ticket);

            commit(mutation.TICKET, { ticket: result.data.ticket });
            // this.ticket = result.data.ticket;
        },
        async fetchTicketComments({ commit }, { ticket, plugin }) {
            commit(mutation.USERS, { users: [] });
            commit(mutation.TICKET_COMMENTS, { ticket_comments: [] });

            const result = await axios.post(plugin.apicaller, {
                handle: 'ticket.comments',
                params: {
                    ticket_id: ticket.id,
                    include: 'users'
                },
            });

            console.log('ticket comments and users:', result.data);

            // this.comments = result.data.comments;
            // this.users = result.data.users;
            commit(mutation.USERS, { users: result.data.users });
            commit(mutation.TICKET_COMMENTS, { ticket_comments: result.data.comments });
        },
        async postRequestComment(context, { request, reply, plugin }){

            let body = JSON.stringify({
                request: {
                    comment: {
                        body: reply
                    }
                }
            });

            await axios.post(plugin.apicaller, {
                handle: 'requests.comments.store',
                params: {
                    request_id: request.id,
                },
                body: body
            });

        },
        async postTicketComment(context, { ticket, reply, plugin }){

            let body = JSON.stringify({
                ticket: {
                    comment: {
                        body: reply
                    }
                }
            });

            await axios.post(plugin.apicaller, {
                handle: 'tickets.comments.store',
                params: {
                    ticket_id: ticket.id,
                },
                body: body
            });

        },
        async postRequest({ commit }, { body, plugin }){
            await axios.post(plugin.apicaller, {
                handle: 'requests.store',
                body: JSON.stringify(body)
            });

            commit(mutation.CREATE_REQUEST, { show: false });
        },
        async fetchRequestComments({ commit }, { request, plugin }) {
            commit(mutation.USERS, { users: [] });
            commit(mutation.REQUEST_COMMENTS, { request_comments: [] });

            const result = await axios.post(plugin.apicaller, {
                handle: 'request.comments',
                params: {
                    request_id: request.id,
                    include: 'users'
                },
            });

            commit(mutation.USERS, { users: result.data.users });
            commit(mutation.REQUEST_COMMENTS, { request_comments: result.data.comments });
        },

    },
    getters: {
        is_creating_request: state => state.is_creating_request,
        is_creating_ticket: state => state.is_creating_ticket,
        me: state => state.me,
        request: state => state.request,
        request_comments: state => state.request_comments,
        requests: state => state.requests,
        plugin: state => state.plugin,
        ticket: state => state.ticket,
        ticket_comments: state => state.ticket_comments,
        tickets: state => state.tickets,
        users: state => state.users,
        shared: state => state.shared,
        public_js_variables: state => state.public_js_variables,
    }

});
