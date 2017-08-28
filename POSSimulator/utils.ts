import { DocumentClient } from 'documentdb';

export class DocDBHelper {

    _host: string;
    _key: string;

    _client: DocumentClient;

    /**
     * 
     * @param host The CosmosDB (Document DB) host name.
     * @param key The access key of the Cosmos DB account.
     */
    constructor(host: string, key: string) {
        this._host = host;
        this._key = key;

        this._client = new DocumentClient(host, { masterKey: key });
    }

    /**
     * Get or create a database in Cosmos DB.
     * @param databaseId Identity of the database.
     */
    getOrCreateDatabase(databaseId): Promise<any> {
        var self = this;
        return new Promise((resolve, reject) => {
            let querySpec: any = {
                query: 'SELECT * FROM root r WHERE r.id = @id',
                parameters: [{
                    name: '@id',
                    value: databaseId
                }]
            };

            self._client.queryDatabases(querySpec).toArray((err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.length === 0) {
                        let databaseSpec = {
                            id: databaseId
                        };

                        self._client.createDatabase(databaseSpec, (err, created) => {                        
                            if (err) {
                                reject(err);
                            } else {
                                resolve(created);
                            }
                        });
                    } else {
                        resolve(results[0]);
                    }
                }
            });
        });
    }

    /**
     * 
     * @param databaseLink 
     * @param collectionId 
     */
    getOrCreateCollection(databaseLink: string, collectionId: string): Promise<any> {
        var self = this;
        return new Promise((resolve, reject) => {
            let querySpec = {
                query: 'SELECT * FROM root r WHERE r.id = @id',
                parameters: [{
                    name: '@id',
                    value: collectionId
                }]
            };

            self._client.queryCollections(databaseLink, querySpec).toArray((err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.length === 0) { /* no results, create a new one */
                        let collectionSpec = {
                            id: collectionId
                        };
                        self._client.createCollection(databaseLink, collectionSpec, (err, created) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(created);
                            }
                        });
                    } else {
                        resolve(results[0]);
                    }
                }
            });
        });
    }

    queryDocuments(databaseLink: string, querySpec: any): Promise<any> {
        var self = this;
        return new Promise((resolve, reject) => {
            self._client.queryDocuments(databaseLink, querySpec).toArray((err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    /**
     * 
     * @param collectionLink 
     * @param item 
     */
    createDocument(collectionLink: string, item: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._client.createDocument(collectionLink, item, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });    
        });
    }
}