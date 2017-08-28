export const config: any = {
    iothub: {
        connectionString: 'HostName={YOUR_IOTHUB_HOSTNAME}.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey={YOUR_SHARED_ACCESS_KEY}'
    },
    docdb: {
        host: 'https://{YOUR_DOCDB_HOSTNAME}.documents.azure.com:443/',
        authKey: '{YOUR_DOCDB_KEY}',
        databaseId: 'devices',
        collectionId: 'registrations'
    },
    num_devices: 8
};