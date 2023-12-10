import { authenticate } from "./authenticate";
import { getResourceState } from "./getResourceState";
import { setResourceState } from "./setResourceState";

export class SOAPRequest {
    cookies;
    private readonly endpoint: string

    constructor(endpoint: string) {
        this.endpoint = endpoint
    }

    async authenticate(auth: any) {
        const { success, cookies } = await authenticate(auth, this.endpoint)
        this.cookies = cookies
        return success
    }

    async getResourceValue(lightId: any) {
        const state = await getResourceState(lightId, this.cookies, this.endpoint)
        return state
    }

    async setResourceValue(device, value: boolean) {
        const state = await setResourceState(device, value, this.cookies, this.endpoint)
        return state
    }
}