<template>
    <div>
        <card>
            <h1>Recente tickets</h1>

            <button @click="is_creating_request = !is_creating_request" class="btn btn-primary mb-15">{{ is_creating_request ? 'Annuleren' : 'Nieuw ticket'}}</button>
            <create-request v-if="is_creating_request"></create-request>

            <div class="loading-dark loading-dark--double" v-if="isLoading.requests"></div>
            <table class="table table-striped table-responsive table-hover" v-if="me.verified && !is_creating_request">
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
                <tr v-if="!isLoading.requests && requests.length < 1">
                    <td colspan="3">
                        Geen tickets
                    </td>
                </tr>
                </tbody>
            </table>
        </card>

        <card v-if="request && !is_creating_request">

            <div v-if="isLoading.request">
                <div class="loading-dark loading-dark--double"></div>
            </div>
            <div v-if="!isLoading.request">

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

            <div v-if="isLoading.requestComments">
                <div class="loading-dark loading-dark--double"></div>
            </div>
            <div style="max-height: 300px; overflow-y: scroll" class="container-fluid" id="js-request-comments">

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
        <card v-if="request && !is_creating_request">
            <reply-to-request></reply-to-request>
        </card>
    </div>
</template>

<script>
import CreateRequest from "./CreateRequest";
import ReplyToRequest from "./ReplyToRequest";
import Card from "../templates/Card";
import {scrollToBottomByElementId} from "../utils/scrollToBottom";
import { gravatar } from "../utils/gravatar";
import {mapState} from "vuex";
import * as dayjs from "dayjs";

export default {
    components: { CreateRequest, Card, ReplyToRequest },
    async mounted(){

        await this.$store.dispatch('fetchRequests')

        // if(localStorage.plugins_zendesk_last_opened_request_id) {
        //     let plugins_zendesk_last_opened_request_id = JSON.parse(localStorage.plugins_zendesk_last_opened_request_id);
        //     await this.showRequest(plugins_zendesk_last_opened_request_id);
        // }

        if(localStorage.concept_comment) {
            this.reply = JSON.parse(localStorage.concept_comment);
        }
    },
    data(){
        return {
            isLoading: {
                request: false,
                requests: false,
                requestComments: false,
            },
            isCreatingRequest: false,
            isReplying: false,
        };
    },
    methods: {
        gravatar,
        async showRequest(request_id) {
            localStorage.plugins_zendesk_last_opened_request_id = JSON.stringify(request_id);

            this.isLoading.request = true;

            try {
                await this.$store.dispatch('fetchRequest', { request_id, plugin: this.plugin });
            } catch(ex) {
                alert('error occured while fetching request');
                console.log('error occured while fetching request', ex);
            }
            this.isLoading.request = false;

            this.isLoading.requestComments = true;
            try {
                await this.$store.dispatch('fetchRequestComments', { request: this.request, plugin: this.plugin });
            } catch(ex) {
                alert('error occured while fetching requests');
                console.log('error occured while fetching requests', ex);
            }
            this.isLoading.requestComments = false;

            this.$nextTick(() => {
                scrollToBottomByElementId("js-request-comments");
            });

        },
    },
    computed: {
        ...mapState([
            'me',
            'plugin',
            'request',
            'request_comments',
            'requests',
            'users'
        ]),
        is_creating_request: {
            get() {
                return this.$store.state.is_creating_request;
            },
            set(newValue) {
                this.$store.dispatch('setIsCreatingRequest', newValue);
            }
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
}
</script>