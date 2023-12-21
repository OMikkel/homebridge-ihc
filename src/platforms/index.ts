import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";
import { HomebridgeIHC } from "../platform";
import { SOAPRequest } from "../lib/request";
import { ResourceState } from "../lib/getResourceState";


export class BasePlatformAccessory {
    service: Service;
    state: ResourceState = {
        value: false,
        typeString: "",
        resourceID: -1,
        isValueRuntime: false
    };

    constructor(
        private readonly platform: HomebridgeIHC,
        private readonly accessory: PlatformAccessory,
        private readonly request: SOAPRequest
    ) {
        this.request = request;
        const accessoryService = this.accessory.getService(this.platform.Service.AccessoryInformation)!;
        accessoryService.setCharacteristic(this.platform.Characteristic.Manufacturer, this.accessory.context?.metadata?.manufacturer || "LK IHC");
        if (this.accessory.context?.metadata?.model) {
            accessoryService.setCharacteristic(this.platform.Characteristic.Model, this.accessory.context?.metadata?.model);
        }
        if (this.accessory.context?.metadata?.serial) {
            accessoryService.setCharacteristic(this.platform.Characteristic.SerialNumber, this.accessory.context?.metadata?.serial);
        }

        this.service = this.accessory.getService(this.accessory.context.device.type === "light" ? this.platform.Service.Lightbulb : this.platform.Service.Switch) || this.accessory.addService(this.accessory.context.device.type === "light" ? this.platform.Service.Lightbulb : this.platform.Service.Switch);
        this.service.setCharacteristic(this.platform.Characteristic.Name, this.accessory.context.device?.name || "Unknown device");

        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onSet(this.setState.bind(this))                // SET - bind to the `setOn` method below
            .onGet(this.getState.bind(this));               // GET - bind to the `getOn` method below

        this.getState();
    }

    async setState(value: CharacteristicValue) {
        this.state.value = value as boolean;

        await this.request.setResourceValue(this.state, value as boolean);

        this.platform.log.debug("Set Characteristic On ->", value);
    }

    async getState() {
        this.state = await this.request.getResourceValue(this.accessory.context.device.id);

        this.platform.log.debug("Light ID: ", this.accessory.context.device.id);

        this.platform.log.debug("Get Characteristic On ->", this.state.value);

        return this.state.value;
    }
}