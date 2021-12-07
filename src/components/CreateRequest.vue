<template>
    <div class="row" >
        <div class="col">
            <div class="loading-dark loading-dark--double" v-if="isLoading.creating_ticket"></div>

            <strong>Onderwerp</strong>
            <input type="text" class="form-control mb-15" v-model="newticket.subject" placeholder="Onderwerp" :disabled="isLoading.creating_ticket">
            <strong>Bericht</strong>
            <textarea class="form-control mb-15" style="min-height: 100px" v-model="newticket.body" :disabled="isLoading.creating_ticket"></textarea>
            <button class="btn btn-sm btn-success" @click="createRequest()" :disabled="isLoading.creating_ticket">{{ isLoading.creating_ticket ? 'Ticket aan het maken..' : 'Ticket insturen' }}</button>
        </div>
    </div>

</template>
<script>
import { debounce as _debounce } from 'lodash';
import { mapGetters } from 'vuex'

export default {
    data() {
        return {
            isLoading: {
                creating_ticket: false,
                fetching_requests: false,
            },
            newticket: {
                subject: '',
                body: '',
            }
        }
    },
    methods: {
        async createRequest(){

            // if(!this.me.id){ // user is unknown create anonymous ticket

            this.isLoading.creating_ticket = true;

            try {
                let body = {
                    request: {
                        requester: {
                            email: this.public_js_variables.current_user.email,
                            name: this.public_js_variables.current_user.firstname
                        },
                        subject: this.newticket.subject,
                        comment: {
                            body: this.newticket.body
                        }
                    }
                };

                await this.$store.dispatch('postRequest', { body, plugin: this.plugin });

                this.newticket.subject = '';
                this.newticket.body = '';

                if(!this.me.verified) {
                    // alert('Dit is de eerste keer dat u een vraag instuurt. U ontvangt een verificatie email van Zendesk. Accepteer deze om uw ingestuurde vragen in te zien!');
                }

                await this.$store.dispatch('fetchRequests');

            } catch (ex) {
                alert(ex);
                console.log(ex);
            }

            this.isLoading.creating_ticket = false;
            this.create = false;



        },
    },
    computed: {
        ...mapGetters([
            'me',
            'plugin',
            'public_js_variables',
            'shared',
            'is_creating_request'
        ])
    },
    watch: {
        'newticket.subject': _debounce(function () {
            localStorage.concept_newticket = JSON.stringify(this.newticket);
        }, 200),
        'newticket.body': _debounce(function () {
            localStorage.concept_newticket = JSON.stringify(this.newticket);
        }, 200),
    }
}
</script>
