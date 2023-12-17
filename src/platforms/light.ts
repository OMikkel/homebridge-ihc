import { PlatformAccessory } from 'homebridge';
import { SOAPRequest } from '../lib/request';
import { HomebridgeIHC } from "../platform";
import { BasePlatformAccessory } from "./index";

export class LightPlatformAccessory extends BasePlatformAccessory {
    constructor(
        platform: HomebridgeIHC,
        accessory: PlatformAccessory,
        request: SOAPRequest
    ) {
        super(platform, accessory, request)

        this.service = accessory.getService(platform.Service.Lightbulb) || accessory.addService(platform.Service.Lightbulb);
    }
}