import { XMLParser } from "fast-xml-parser"

// @ts-ignore
export const setResourceState = async (device, value: boolean, cookies: string, endpoint: string): Promise<boolean> => {
    const result = await fetch(`${endpoint}/ws/ResourceInteractionService`, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml",
            "SOAPAction": "setResourceValue",
            "Cookie": cookies
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
        const parser = new XMLParser()
        const body = await res.text()
        return true
    }).catch(err => {
        console.log(err)
        return false
    })

    return result
}