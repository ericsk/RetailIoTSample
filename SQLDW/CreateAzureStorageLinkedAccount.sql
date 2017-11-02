IF NOT EXISTS (SELECT * FROM sys.symmetric_keys where name = '##MS_DatabaseMasterKey##')
CREATE MASTER KEY;
CREATE DATABASE SCOPED CREDENTIAL AzureStorageCredential
WITH
IDENTITY = '<Azure storage account name>',
SECRET = '<Azure storage key>';

CREATE EXTERNAL DATA SOURCE AzureStorage
WITH (
    TYPE = HADOOP,
    LOCATION = 'wasbs://processeddata@<Storage Account Name>.blob.core.windows.net',
    CREDENTIAL = AzureStorageCredential
);

CREATE EXTERNAL FILE FORMAT TextFile
WITH (
    FORMAT_TYPE = DelimitedText,
    FORMAT_OPTIONS (FIELD_TERMINATOR = ',')
);