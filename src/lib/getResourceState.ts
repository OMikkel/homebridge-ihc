import { XMLParser } from "fast-xml-parser"

// @ts-ignore
export const getResourceState = async (lightId: any, cookies: string, endpoint: string): Promise<{value: boolean, typeString: "", resourceID: number, isValueRuntime: boolean}> => {
    const result = await fetch(`${endpoint}/ws/ResourceInteractionService`, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml",
            "SOAPAction": "getRuntimeValue",
            "Cookie": cookies
        },
        body: `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
 <soapenv:Body>
    <getRuntimeValue1>${lightId}</getRuntimeValue1>
 </soapenv:Body>
</soapenv:Envelope>
        `
    }).then(async (res) => {
        const parser = new XMLParser()
        const body = await res.text()
        const parsedXML = parser.parse(body)
        return {
            value: parsedXML["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getRuntimeValue2"]["ns1:value"]["ns2:value"] as boolean,
            typeString: parsedXML["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getRuntimeValue2"]["ns1:typeString"] as string,
            resourceID: parsedXML["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getRuntimeValue2"]["ns1:resourceID"] as number,
            isValueRuntime: parsedXML["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getRuntimeValue2"]["ns1:isValueRuntime"] as boolean,
        }
    }).catch(err => {
        console.log(err)
        return {
            value: false,
            typeString: "",
            resourceID: -1,
            isValueRuntime: false
        }
    })

    // @ts-ignore
    return result
}