CREATE TABLE IF NOT EXISTS storeActivity (
    eventdate timestamp,
    userid string,
    productid string,
    quantity int,
    price int
) 
PARTITIONED BY (year int, month int, day int) 
ROW FORMAT DELIMITED 
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n' 
STORED AS TEXTFILE LOCATION 'wasbs://processeddata@example.blob.core.windows.net/structuredlogs';

ALTER TABLE storeActivity ADD IF NOT EXISTS PARTITION (year=2017, month=10, day=31) LOCATION 'wasbs://processeddata@example.blob.core.windows.net/structuredlogs/2017/10/31';