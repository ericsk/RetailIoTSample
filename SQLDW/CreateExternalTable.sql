CREATE SCHEMA [asb]
GO

CREATE EXTERNAL TABLE asb.StoreActivityExternal
(
	EventDate datetime2,
	UserId nvarchar(20),
	ProductId nvarchar(20), 
	Quantity int, 
	Price int
)
WITH (
    LOCATION='/structuredlogs/',
    DATA_SOURCE=AzureStorage,
    FILE_FORMAT=TextFile
);

