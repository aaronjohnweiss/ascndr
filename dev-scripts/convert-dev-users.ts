import {readFileSync, writeFileSync} from 'fs'
import prompt_sync from "prompt-sync";

const prompt = prompt_sync()

const prodToDevIds: Record<string, string> = {
    'GDYFUaFdq8OLmnzSLmZumVwMcKs2': 'VsI36W1w0LSfVRZaYtwqXTubSqC3', // Ed
    'xbGSEC0ykSdSoKL37kIDpNL3yPu1': 'qkJdMxFTdpbEc6Imuryc5gY28Ef2', // Jenna
    'MoyRA4UqIxanlL3dwT1y8cWaEkC3': 'eFvXbMugvvYnw3uSt9LWGPOANe83', // Nick
    '05SdQfOUnDWJdeCJggljggTzVTn1': 'UuUY4kS7nxQy5MseDB71KmsZTMu1', // Joe
};

const convertMembers = (data: any, idMap: Record<string, string>) => {
    let jsonString = JSON.stringify(data);

    Object.keys(idMap).forEach(id => {
        jsonString = jsonString.replaceAll(id, idMap[id]);
    })

    return JSON.parse(jsonString);
}

const fileName = prompt('Enter input file name: ') || './prodData.json'

const convertedData = convertMembers(readFileSync(fileName, 'utf-8'), prodToDevIds);

const outFileName = prompt('Enter output file name: ') || './devData.json'

writeFileSync(outFileName, convertedData)


