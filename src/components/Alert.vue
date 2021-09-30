<template>
    <div class="alert" :class="classes" role="alert" v-if="show">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close" v-if="can_close" @click="show = false">
            <span aria-hidden="true">×</span>
        </button>
        <span v-html="message"></span>
    </div>
</template>
<script>
export default {
    props: {
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: false,
            default: 'success',
        },
        can_close: {
            type: Boolean,
            required: false,
            default: true,
        },
    },
    data() {
        return {
            show: true,
        }
    },
    computed: {
        classes() {
           return {
               'alert-dismissible': this.can_close,
               'alert-success': this.type === 'success',
               'alert-warning': this.type === 'warning',
               'alert-danger': this.type === 'danger',
               'alert-primary': this.type === 'primary',
               'alert-info': this.type === 'info',
           }
        }
    }
}
</script>
