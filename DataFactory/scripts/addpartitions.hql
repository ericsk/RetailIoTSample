CREATE EXTERNAL TABLE IF NOT EXISTS LogsRaw (jsonentry string) 
PARTITIONED BY (year INT, month INT, day INT)
STORED AS TEXTFILE LOCATION "wasbs://logs@${hiveconf:StorageAccountName}.blob.core.windows.net/";
ALTER TABLE LogsRaw ADD IF NOT EXISTS PARTITION (year=${hiveconf:Year}, month=${hiveconf:Month}, day=${hiveconf:Day}) LOCATION 'wasbs://logs@${hiveconf:StorageAccountName}.blob.core.windows.net/${hiveconf:Year}/${hiveconf:Month}/${hiveconf:Day}';

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
STORED AS TEXTFILE LOCATION 'wasbs://processeddata@${hiveconf:StorageAccountName}.blob.core.windows.net/structuredlogs';
ALTER TABLE storeActivity ADD IF NOT EXISTS PARTITION (year=${hiveconf:Year}, month=${hiveconf:Month}, day=${hiveconf:Day}) LOCATION 'wasbs://processeddata@${hiveconf:StorageAccountName}.blob.core.windows.net/structuredlogs/${hiveconf:Year}/${hiveconf:Month}/${hiveconf:Day}';