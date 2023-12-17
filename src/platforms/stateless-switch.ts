import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";
import { HomebridgeIHC } from "../platform";
import { SOAPRequest } from "../lib/request";

type State = {
    value: boolean;
    typeString: string;
    resourceID: number;
    isValueRuntime: boolean;
};

export class StatelessSwitchlatformAccessory {
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
        const accessoryService = this.accessory.getService(this.platform.Service.AccessoryInformation)!;
        accessoryService.setCharacteristic(this.platform.Characteristic.Manufacturer, this.accessory.context?.metadata?.manufacturer || "LK IHC");
        if (this.accessory.context?.metadata?.model) {
            accessoryService.setCharacteristic(this.platform.Characteristic.Model, this.accessory.context?.metadata?.model);
        }
        if (this.accessory.context?.metadata?.serial) {
            accessoryService.setCharacteristic(this.platform.Characteristic.SerialNumber, this.accessory.context?.metadata?.serial);
        }
        this.service = this.accessory.getService(this.platform.Service.StatelessProgrammableSwitch) || this.accessory.addService(this.platform.Service.StatelessProgrammableSwitch);
        this.service.setCharacteristic(this.platform.Characteristic.Name, this.accessory.context.device?.name || "Unknown device");

        this.service.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
            .onGet(this.getState.bind(this));              // GET - bind to the `getOn` method below

        this.getState();
    }

    // async setState(value: CharacteristicValue) {
    //     this.state.value = value as boolean;

    //     await this.request.setResourceValue(this.state, value as boolean);

    //     this.platform.log.debug("Set Characteristic On ->", value);
    // }

    async getState() {
        this.platform.log.debug("Triggered GET ProgrammableSwitchEvent");

        // set this to a valid value for ProgrammableSwitchEvent
        const currentValue = this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;

        return currentValue;
    }
}