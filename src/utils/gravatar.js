import {md5} from "./md5";

export function gravatar(email = '') {
    return 'https://secure.gravatar.com/avatar/' + md5(email ?? '') + '?d=mp';
}
