import { CharacteristicValue, PlatformAccessory, Service } from "homebridge";
import { SOAPRequest } from "../lib/request";
import { HomebridgeIHC } from "../platform";

type State = {
    value: boolean;
    typeString: string;
    resourceID: number;
    isValueRuntime: boolean;
};

export class ButtonPlatformAccessory {
    private readonly buttonWait: number;
    service: Service;
    state: State = {
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
        this.buttonWait = this.accessory.context.device.wait || 2000;
        const accessoryService = this.accessory.getService(this.platform.Service.AccessoryInformation)!;
        accessoryService.setCharacteristic(this.platform.Characteristic.Manufacturer, this.accessory.context?.metadata?.manufacturer || "LK IHC");
        if (this.accessory.context?.metadata?.model) {
            accessoryService.setCharacteristic(this.platform.Characteristic.Model, this.accessory.context?.metadata?.model);
        }
        if (this.accessory.context?.metadata?.serial) {
            accessoryService.setCharacteristic(this.platform.Characteristic.SerialNumber, this.accessory.context?.metadata?.serial);
        }

        this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
        this.service.setCharacteristic(this.platform.Characteristic.Name, this.accessory.context.device?.name || "Unknown device");

        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onSet(this.setState.bind(this))                // SET - bind to the `setOn` method below
            .onGet(this.getState.bind(this));               // GET - bind to the `getOn` method below

        this.getState();
    }

    async setState(value: CharacteristicValue) {
        this.state.value = value as boolean;

        if (this.state.value) {
            this.platform.log.debug(`Setting ${this.accessory.context.device.name} to true`);
            this.service.updateCharacteristic(this.platform.Characteristic.On, true);
            await this.request.setResourceValue(this.state, true);

            this.platform.log.debug(`Waiting ${this.buttonWait} ms before setting ${this.accessory.context.device.name} to false`);
            await new Promise(resolve => setTimeout(resolve, this.buttonWait));

            this.platform.log.debug(`Setting ${this.accessory.context.device.name} to false`);
            this.service.updateCharacteristic(this.platform.Characteristic.On, false);
            await this.request.setResourceValue(this.state, false);
        }
    }

    async getState() {
        this.state = await this.request.getResourceValue(this.accessory.context.device.id);

        this.platform.log.debug("Light ID: ", this.accessory.context.device.id);

        this.platform.log.debug(`Getting ${this.accessory.context.device.name} state: ${this.state.value}`);

        return this.state.value;
    }
}