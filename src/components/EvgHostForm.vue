<script setup lang="ts">
import { ref } from 'vue';
import { EvgRequest } from '../services/EvgRequest';

const OPENSRF_JS_PATH = 'js/dojo/opensrf/opensrf.js';

const evgHost = ref('192.168.1.85');
const username = ref('');
const password = ref('');
const connectionOK = ref(false);
const evgVersion = ref('');
const selectedService = ref('open-ils.actor');
const searchFilter = ref('');
const numResults = ref(0);
const methods = ref([]);

let _baseUrl = '';

function checkConnection(): void {
    _baseUrl = evgHost.value;
    if (!_baseUrl.match(/^https*:\/\//)) {
        _baseUrl = 'https://' + _baseUrl;
    }
    if (!_baseUrl.match(/\/$/)) {
        _baseUrl += '/';
    }
    fetch(_baseUrl + OPENSRF_JS_PATH).then(async reponse => {
        connectionOK.value = true;
        EvgRequest.setBaseUrl(_baseUrl);
        const req = new EvgRequest('open-ils.actor', 'opensrf.open-ils.system.ils_version', []);
        req.send().then(resp => evgVersion.value = resp[0]);
    })
    .catch(error => {
        connectionOK.value = false;
    });

}

function fetchApiInfo() {
    const req = new EvgRequest(selectedService.value, 'opensrf.system.method', [searchFilter.value]);
    req.send().then(resp => {
        numResults.value = resp.length;
        const mungedInfo: any[] = [];
        resp.forEach((element: any ) => {
            if ("__p" in element) {
                // we're a Perl method
                mungedInfo.push(element.__p);
            } else {
                // we're a C method
                mungedInfo.push(element);
            }
        });
        methods.value = mungedInfo;
    });
}

function isArray(val: any): boolean {
    return Array.isArray(val);
}
</script>

<template>
    <div class="input-group">
        <input v-model="evgHost" placeholder="Evergreen host" aria-label="Evergreen host" class="form-control">
        <!--
        <li>Username <input v-model="username"></li>
        <li>Password <input v-model="password" type="password"></li>
        -->
        <button @click="checkConnection" class="btn btn-primary">Connect to Evergreen</button>
    </div>
    <div class="input-group" v-if="connectionOK">
        <select v-model="selectedService" class="form-control" aria-label="Evergreen service">
            <option value="open-ils.acq">open-ils.acq</option>
            <option value="open-ils.actor">open-ils.actor</option>
            <option value="open-ils.auth">open-ils.auth</option>
            <option value="open-ils.auth_proxy">open-ils.auth_proxy</option>
            <option value="open-ils.booking">open-ils.booking</option>
            <option value="open-ils.cat">open-ils.cat</option>
            <option value="open-ils.circ">open-ils.circ</option>
            <option value="open-ils.collections">open-ils.collections</option>
            <option value="open-ils.courses">open-ils.courses</option>
            <option value="open-ils.curbside">open-ils.curbside</option>
            <option value="open-ils.ebook_api">open-ils.ebook_api</option>
            <option value="open-ils.fielder">open-ils.fielder</option>
            <option value="open-ils.pcrud">open-ils.pcrud</option>
            <option value="open-ils.reporter">open-ils.reporter</option>
            <option value="open-ils.search">open-ils.search</option>
            <option value="open-ils.serial">open-ils.serial</option>
            <option value="open-ils.supercat">open-ils.supercat</option>
            <option value="open-ils.url_verify">open-ils.url_verify</option>
            <option value="open-ils.vandelay">open-ils.vandelay</option>
            <option value="opensrf.math">opensrf.math</option>
        </select>
        <input v-model="searchFilter" class="form-control" placeholder="Method filter" aria-label="Method filter">
        <button @click="fetchApiInfo" class="btn btn-info">Fetch API information</button>
    </div>
    <div v-if="numResults > 0">
        Result count is {{ numResults }}
        <ul>
            <li v-for="method in methods" :key="methods.api_name">
                <ul>
                    <li>API name: {{ method.api_name }}</li>
                    <li v-if="method.package">Found in Perl package {{ method.package }}</li>
                    <li v-if="method.method">Implemented in routine {{ method.method }}</li>
                    <li v-if="method.notes">Notes: {{ method.notes }}</li>
                    <li v-if="method.NOTES">Notes: {{ method.NOTES }}</li>
                    <li v-if="method.stream">API streams its responses</li>
                    <li v-if="method.signature">
                        Description: {{ method.signature.desc }}<br>
                        <span v-if="method.signature.params">
                            Parameters
                            <span v-if="isArray(method.signature.params) && method.signature.params.length > 0">
                                <ol>
                                    <li v-for="param in method.signature.params">
                                        {{ param.name }} <span v-if="param.desc">{{ param.desc }}</span>
                                    </li>
                                </ol>
                            </span>
                            <span v-if="!isArray(method.signature.params)">
                                <pre>{{ method.signature.params }}</pre>
                            </span>
                        </span>
                        <span v-if="method.signature.return && method.signature.return.desc">
                            Return value: {{ method.signature.return.desc }}
                        </span>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<style>
</style>