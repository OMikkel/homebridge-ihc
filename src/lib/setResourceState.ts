import { XMLParser } from "fast-xml-parser";
import { ResourceState } from "./getResourceState";
import { SOAPRequest } from "./request";

export const setResourceState = async (SOAPRequest: SOAPRequest, device: ResourceState, value: boolean): Promise<boolean> => {
    const result = await fetch(SOAPRequest.endpointURL("ResourceInteractionService"), {
        method: "POST",
        headers: {
            "Content-Type": "text/xml",
            "SOAPAction": "setResourceValue",
            "Cookie": SOAPRequest.cookies
        },
        body: `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <soapenv:Body>
        <setResourceValue1>
            <value xmlns:ns2="utcs.values"  xsi:type="ns2:WSBooleanValue">
                <value xsi:type="xsd:boolean">${value}</value>
            </value>
            <typeString>${device.typeString}</typeString>
            <resourceID>${device.resourceID}</resourceID>
            <isValueRuntime>${device.isValueRuntime}</isValueRuntime>
        </setResourceValue1>
    </soapenv:Body>
</soapenv:Envelope>
        `
    }).then(async (res) => {
        const parser = new XMLParser();
        const body = await res.text();
        const parsedXML = parser.parse(body)["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];

        if (parsedXML?.["SOAP-ENV:Fault"]) {
            SOAPRequest.platform.log.debug("Not authenticated, reauthenticating");
            const authenticated = await SOAPRequest.authenticate({
                username: SOAPRequest.platform.config.username,
                password: SOAPRequest.platform.config.password,
                level: SOAPRequest.platform.config.level
            });
            if (!authenticated) {
                throw new Error("Attempt to reauthenticate failed");
            }
            return SOAPRequest.setResourceValue(device, value);
        }

        return true;
    }).catch(err => {
        SOAPRequest.platform.log.debug(err);
        return false;
    });

    return result;
};