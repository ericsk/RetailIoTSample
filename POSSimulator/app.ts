import * as iothub from 'azure-iothub';
import * as iothubMqtt from 'azure-iot-device-mqtt';
import { Message } from 'azure-iot-device';

import { DocDBHelper } from './utils';
import { config } from './config';

let docdbHelper: DocDBHelper;
let devices: Array<any> = [];
let databaseLink: any;
let collectionLink: any;

function initAsync(): Promise<void> {
    return new Promise((resolve, reject) => {
        docdbHelper = new DocDBHelper(config.docdb.host, config.docdb.authKey);
        docdbHelper.getOrCreateDatabase(config.docdb.databaseId)
            .then((db: any) => {
                databaseLink = db;
                docdbHelper.getOrCreateCollection(db._self, config.docdb.collectionId)
                    .then((coll) => {
                        collectionLink = coll;
                        resolve();
                    });
            });
    });
}

function registerNewDevices() {
    return new Promise((resolve, reject) => {
        let registry  = iothub.Registry.fromConnectionString(config.iothub.connectionString);
        for (let i = 0; i < config.num_devices; ++i) {
            let device = { deviceId: `POS_${i}` };
            registry.create(device, (err, deviceInfo, response) => {
                if (err) {
                    registry.get(device.deviceId, storeDeviceInDb);
                } else {
                    storeDeviceInDb(err, deviceInfo, response);                
                }
            });
        }    
    });
}

function storeDeviceInDb(err, deviceInfo, response) {
    docdbHelper.createDocument(collectionLink._self, deviceInfo)
        .then((response) => {
            console.log(`Device ${deviceInfo.deviceId} has been stored in DocDB.`);
        });
}

function createOrLoadDevices(): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
        // check if there's any devices stored in docdb
        docdbHelper.queryDocuments(collectionLink._self, { query: 'SELECT * FROM root' })
            .then((devices) => {
                if (devices.length == 0) {
                    // REGISTER new
                    registerNewDevices().then(() => {
                        resolve(devices);
                    });
                } else {
                    resolve(devices);
                }
            });
    });
}

initAsync()
    .then(() => {
        return createOrLoadDevices();
    }).then((devices: Array<any>) => {
        for (let i = 0; i < devices.length; ++i) {
            let client = iothubMqtt.clientFromConnectionString(`HostName=skretail.documents.azure.com;DeviceId=POS_${i};SharedAccessKey=${devices[i].authentication.symmetricKey.primaryKey}`);            
            /* send message in 1s interval. */
            setInterval(() => {
                let data = { deviceId: `POS_${i}`, productId: 1 + Math.floor(Math.random() * 15), quantity: 1 + Math.floor(Math.random() * 5) };
                let message = new Message(JSON.stringify(data));
                console.log(`Sending message ${message.getData()}...`);
                client.sendEvent(message, (err, res) => {
                    if (err) console.error(`[POS_${i}] error: ${err.toString()}`);
                    if (res) console.log(`[POS_${i}]  status: ${res.constructor.name}`);
                })
            },1000);
        }

    }).catch((e) => {
        console.error(e);
    });
