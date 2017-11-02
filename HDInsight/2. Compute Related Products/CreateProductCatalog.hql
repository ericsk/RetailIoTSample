DROP TABLE IF EXISTS RawProductCatalog;
	CREATE EXTERNAL TABLE RawProductCatalog (
		jsonentry string
	) STORED AS TEXTFILE LOCATION "wasbs://ref@${hiveconf:StorageAccountName}.blob.core.windows.net/catalog/";
	

	DROP TABLE IF EXISTS ProductCatalog;
	CREATE TABLE ProductCatalog ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n'
	LOCATION 'wasbs://processeddata@<StorageAccountName>.blob.core.windows.net/product_catalog/'
	AS SELECT get_json_object(jsonentry, "$.productId") as productId,
			  get_json_object(jsonentry, "$.category") as category,
			  get_json_object(jsonentry, "$.name") as name,
			  get_json_object(jsonentry, "$.price") as price
	FROM RawProductCatalog;