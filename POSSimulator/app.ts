import * as iothub from 'azure-iothub';
import * as iothubMqtt from 'azure-iot-device-mqtt';
import { Message } from 'azure-iot-device';
import * as dateformat from 'dateformat';

import { DocDBHelper } from './utils';
import { config } from './config';

let docdbHelper: DocDBHelper;
let iothubRetistry: any;
let databaseLink: any;
let collectionLink: any;

function initAsync(): Promise<void> {
    return new Promise((resolve, reject) => {
        // initialize IoT Hub client registry
        iothubRetistry  = iothub.Registry.fromConnectionString(`HostName=${config.iothub.host};SharedAccessKeyName=iothubowner;SharedAccessKey=${config.iothub.key}`);

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

function registerNewDevices(deviceId: string): Promise<any> {
    return new Promise((resolve, reject) => {
        let device = { 'deviceId': deviceId };
        iothubRetistry.create(device, (err, deviceInfo, response) => {
            if (err) {
                iothubRetistry.get(device.deviceId, storeDeviceInDb);
            } else {
                storeDeviceInDb(err, deviceInfo, response);                
            }
            resolve(deviceInfo);
        });
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
                    let deviceCreationPromises: Array<Promise<void>> = [];
                    
                    for (let i = 0; i < config.num_devices; ++i) {
                        deviceCreationPromises.push(registerNewDevices(`POS_${i}`));
                    }

                    Promise.all(deviceCreationPromises).then((devices) => {
                        resolve(devices);
                    })

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
            let client = iothubMqtt.clientFromConnectionString(`HostName=${config.iothub.host};DeviceId=${devices[i].deviceId};SharedAccessKey=${devices[i].authentication.symmetricKey.primaryKey}`);
            /* send message in 1s interval. */
            setInterval(() => {
                let data = { 
                    deviceId: `${devices[i].deviceId}`, 
                    productId: 1 + Math.floor(Math.random() * 15), 
                    quantity: 1 + Math.floor(Math.random() * 5),
                    eventDate: dateformat(new Date(), "yyyy-MM-ddTHH:mm:ssZ")
                };
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
