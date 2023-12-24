import { HomebridgeIHC } from "../platform";
import { Auth, authenticate } from "./authenticate";
import { ResourceState, getResourceState } from "./getResourceState";
import { setResourceState } from "./setResourceState";

export class SOAPRequest {
    cookies = "";
    readonly platform: HomebridgeIHC;
    private readonly endpoint: string;

    constructor(platform: HomebridgeIHC) {
        this.platform = platform;
        let url = platform.config.endpoint;
        if (url.endsWith("/")) {
            url = url.slice(0, -1);
        }
        this.endpoint = url;
    }

    endpointURL(service: "ResourceInteractionService" | "AuthenticationService") {
        return `${this.endpoint}/ws/${service}`;
    }

    async authenticate(auth: Auth) {
        const { success, cookies } = await authenticate(this, auth);
        this.cookies = cookies;
        this.keepSessionAlive(auth);
        return success;
    }

    private async keepSessionAlive(auth: Auth) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            this.platform.log.debug("Keeping session alive");
            await new Promise(resolve => setTimeout(resolve, auth.interval * 60 * 1000));
            const { success, cookies } = await authenticate(this, auth);
            if (success) {
                this.platform.log.debug("Session kept alive", JSON.stringify({ success, cookies, auth, currentCookies: this.cookies }));
                this.cookies = cookies;
            } else {
                this.platform.log.debug("Failed to reauthenticate", JSON.stringify({ success, cookies, auth, currentCookies: this.cookies }));
            }
        }
    }

    async getResourceValue(lightId: string) {
        const state = await getResourceState(this, lightId);
        return state;
    }

    async setResourceValue(device: ResourceState, value: boolean) {
        const state = await setResourceState(this, device, value);
        return state;
    }
}