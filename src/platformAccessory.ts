import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { HomebridgeIHC } from './platform';
import { getResourceState } from './lib/getResourceState';
import { SOAPRequest } from './lib/request';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ExamplePlatformAccessory {
    private readonly request: SOAPRequest
    private service: Service;
    private state: {
        value: boolean,
        typeString: string,
        resourceID: number,
        isValueRuntime: boolean
    } = {
            value: false,
            typeString: "",
            resourceID: -1,
            isValueRuntime: false
    }

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */

  constructor(
    private readonly platform: HomebridgeIHC,
      private readonly accessory: PlatformAccessory,
    request: SOAPRequest
  ) {
      this.request = request

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'LK IHC')
      .setCharacteristic(this.platform.Characteristic.Model, 'Basic Lightbulb')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
          .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below
      
    this.getState()
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
      this.state.value = value as boolean;
      
      await this.request.setResourceValue(this.state, value as boolean)

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
      await this.getState()
      this.platform.log.debug("Light ID: ", this.accessory.context.device.id)

    this.platform.log.debug('Get Characteristic On ->', this.state.value);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return this.state.value;
  }
    
    async getState() {
        const state = await this.request.getResourceValue(this.accessory.context.device.id)
        this.state = state
    }

}
