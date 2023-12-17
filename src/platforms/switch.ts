import { PlatformAccessory } from 'homebridge';
import { SOAPRequest } from '../lib/request';
import { HomebridgeIHC } from "../platform";
import { BasePlatformAccessory } from "./index";

export class SwitchPlatformAccessory extends BasePlatformAccessory {
    constructor(
        platform: HomebridgeIHC,
        accessory: PlatformAccessory,
        request: SOAPRequest
    ) {
        super(platform, accessory, request)

        this.service = accessory.getService(platform.Service.Switch) || accessory.addService(platform.Service.Switch);
    }
}