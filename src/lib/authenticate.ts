import { XMLParser } from "fast-xml-parser";
import { SOAPRequest } from "./request";

export type Auth = {
    username: string;
    password: string;
    level: "treeview" | "openapi" | "administrator";
    interval: number;
};

export const authenticate = async (SOAPRequest: SOAPRequest, auth: Auth): Promise<{ success: boolean; cookies: string }> => {
    const result = await fetch(SOAPRequest.endpointURL("AuthenticationService"), {
        method: "POST",
        headers: {
            "Content-Type": "text/xml",
            "SOAPAction": "authenticate"
        },
        body: `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
 <soapenv:Body>
  <authenticate1>
    <username>${auth.username}</username>
    <password>${auth.password}</password>
    <application>${auth.level}</application>
  </authenticate1>
 </soapenv:Body>
</soapenv:Envelope>
        `
    }).then(async (res) => {
        const parser = new XMLParser();
        const cookies = res.headers.get("set-cookie");
        const body = await res.text();
        const parsedXML = parser.parse(body);
        if (parsedXML["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:authenticate2"]["ns1:loginWasSuccessful"]) {
            return {
                success: true,
                cookies: cookies || ""
            };
        } else {
            SOAPRequest.platform.log.debug("Invalid user credentials");
            return {
                success: false,
                cookies: ""
            };
        }
    }).catch(err => {
        SOAPRequest.platform.log.debug(err);
        return {
            success: false,
            cookies: ""
        };
    });

    return result;
};

//wait for 5 seconds
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));