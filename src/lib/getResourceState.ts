import { XMLParser } from "fast-xml-parser";
import { SOAPRequest } from "./request";

export type ResourceState = {
    value: boolean;
    typeString: string;
    resourceID: number;
    isValueRuntime: boolean;
};

export const getResourceState = async (SOAPRequest: SOAPRequest, lightId: string): Promise<ResourceState> => {
    const result = await fetch(SOAPRequest.endpointURL("ResourceInteractionService"), {
        method: "POST",
        headers: {
            "Content-Type": "text/xml",
            "SOAPAction": "getRuntimeValue",
            "Cookie": SOAPRequest.cookies
        },
        body: `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
 <soapenv:Body>
    <getRuntimeValue1>${lightId}</getRuntimeValue1>
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
            return SOAPRequest.getResourceValue(lightId);
        }

        return {
            value: parsedXML["ns1:getRuntimeValue2"]["ns1:value"]["ns2:value"] as boolean,
            typeString: parsedXML["ns1:getRuntimeValue2"]["ns1:typeString"] as string,
            resourceID: parsedXML["ns1:getRuntimeValue2"]["ns1:resourceID"] as number,
            isValueRuntime: parsedXML["ns1:getRuntimeValue2"]["ns1:isValueRuntime"] as boolean,
        };
    }).catch(err => {
        SOAPRequest.platform.log.debug(err);
        return {
            value: false,
            typeString: "",
            resourceID: -1,
            isValueRuntime: false
        };
    });

    return result;
};