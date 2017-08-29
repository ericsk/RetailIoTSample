export const config: any = {
    iothub: {
        host: '{YOUR_IOTHUB_HOSTNAME}',
        key: '{YOUR_IOTHUB_KEY}'
    },
    docdb: {
        host: 'https://{YOUR_DOCDB_HOST}.documents.azure.com:443/',
        authKey: '{YOUR_DOCDB_KEY}',
        databaseId: 'devices',
        collectionId: 'registrations'
    },
    num_devices: 8
};