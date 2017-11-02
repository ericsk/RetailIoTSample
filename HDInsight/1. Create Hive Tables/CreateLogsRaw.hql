CREATE EXTERNAL TABLE IF NOT EXISTS LogsRaw (jsonentry string) 
    PARTITIONED BY (year INT, month INT, day INT)
    STORED AS TEXTFILE LOCATION "wasbs://{CONTAINER}@{STORAGE_ACCOUNT}.blob.core.windows.net/";

ALTER TABLE LogsRaw ADD IF NOT EXISTS PARTITION (year=2017, month=11, day=01) LOCATION 'wasbs://{CONTAINER}@{STORAGE_ACCOUNT}.blob.core.windows.net/2017/11/01';
ALTER TABLE LogsRaw ADD IF NOT EXISTS PARTITION (year=2017, month=11, day=02) LOCATION 'wasbs://{CONTAINER}@{STORAGE_ACCOUNT}.blob.core.windows.net/2017/11/02';
ALTER TABLE LogsRaw ADD IF NOT EXISTS PARTITION (year=2017, month=11, day=03) LOCATION 'wasbs://{CONTAINER}@{STORAGE_ACCOUNT}.blob.core.windows.net/2017/11/03';

SELECT * from LogsRaw limit 1;