import {
    API,
    Characteristic,
    DynamicPlatformPlugin,
    Logger,
    PlatformAccessory,
    PlatformConfig,
    Service,
} from "homebridge";

import { SOAPRequest } from "./lib/request";
import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import { BasePlatformAccessory } from "./platforms/index";
import { ButtonPlatformAccessory } from "./platforms/button";

export class HomebridgeIHC implements DynamicPlatformPlugin {
    public readonly Service: typeof Service = this.api.hap.Service;
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
    public readonly accessories: PlatformAccessory[] = [];

    constructor(
        public readonly log: Logger,
        public readonly config: PlatformConfig,
        public readonly api: API
    ) {
        const request = new SOAPRequest(this);
        this.log.debug("Finished initializing platform:", this.config.name);

        this.api.on("didFinishLaunching", async () => {
            log.debug("Executed didFinishLaunching callback");

            const authenticated = await request.authenticate(config.auth);
            if (authenticated) {
                this.discoverDevices(request);
            } else {
                this.log.warn("Terminating - Invalid user credentials");
            }
        });
    }

    configureAccessory(accessory: PlatformAccessory) {
        this.log.info("Loading accessory from cache:", accessory.displayName);

        this.accessories.push(accessory);
    }

    discoverDevices(request: SOAPRequest) {
        const devices = this.config.devices;

        for (const device of devices) {
            const uuid = this.api.hap.uuid.generate(device.id);

            const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);

            if (existingAccessory) {
                this.log.info("Restoring existing accessory from cache:", existingAccessory.displayName);

                if (existingAccessory.context.device.type === "button") {
                    new ButtonPlatformAccessory(this, existingAccessory, request);
                } else {
                    new BasePlatformAccessory(this, existingAccessory, request);
                }

            } else {
                this.log.info("Adding new accessory:", device.name);

                const accessory = new this.api.platformAccessory(device.name, uuid);

                accessory.context.device = device;

                if (accessory.context.device.type === "button") {
                    new ButtonPlatformAccessory(this, accessory, request);
                } else {
                    new BasePlatformAccessory(this, accessory, request);
                }

                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }
        }
    }
}
