<template>
    <div>
        <strong>Reageren</strong>

        <div class="loading-dark loading-dark--double" v-if="is_loading.posting_reply"></div>

        <textarea class="form-control mb-15" style="min-height: 100px" v-model="reply.body" @keyup.ctrl.enter="sendReply()" v-if="!is_loading.posting_reply"></textarea>
        <button @click="sendReply()" class="btn btn-sm btn-success" :disabled="is_loading.posting_reply">Send</button>
    </div>
</template>
<script>
import {mapGetters, mapState} from 'vuex';
import { debounce as _debounce } from 'lodash';
import { scrollToBottomByElementId } from '../utils/scrollToBottom';

export default {
    data() {
        return {
            is_loading: {
                posting_reply: false,
            },
            reply: {
                body: '',
            },
        };
    },
    methods: {
        async sendReply() {

            this.is_loading.posting_reply = true;

            try {

                await this.$store.dispatch('postRequestComment', {
                    request: this.request,
                    reply: this.reply.body,
                    plugin: this.plugin
                });

                this.reply.body = '';

                // console.log('result reply:', result.data);

            } catch (ex) {
                alert('an error occured while posting an reply to zendesk ex', ex);
            }

            this.is_loading.posting_reply = false

            await this.$store.dispatch('fetchRequestComments', { request: this.request, plugin: this.plugin });

            scrollToBottomByElementId("js-request-comments");

        }
    },
    watch: {
        'reply.body': _debounce(function () {
            localStorage.concept_request_comment = JSON.stringify(this.reply);
        }, 200),
    },
    computed: {
        ...mapState([
            'public_js_variables'
        ]),
        ...mapGetters([
            'me',
            'plugin',
            'public_js_variables',
            'request',
            'request_comments',
            'requests',
            'ticket',
            'ticket_comments',
            'tickets',
            'users',
            'shared'
        ])
    },
}
</script>
