import {readFileSync, writeFileSync} from 'fs'
import prompt_sync from "prompt-sync";

const prompt = prompt_sync()

const prodToDevIds: Record<string, string> = {
    'GDYFUaFdq8OLmnzSLmZumVwMcKs2': 'VsI36W1w0LSfVRZaYtwqXTubSqC3' // Ed
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


