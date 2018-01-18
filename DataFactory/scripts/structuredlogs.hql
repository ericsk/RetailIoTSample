INSERT OVERWRITE TABLE storeActivity Partition (year, month, day) 
SELECT 
  CAST(CONCAT(split(get_json_object(jsonentry, "$.eventdate"),'T')[0], ' ', SUBSTRING(split(get_json_object(jsonentry, "$.eventdate"),'T')[1],0,LENGTH(split(get_json_object(jsonentry, "$.eventdate"),'T')[1])-1)) as TIMESTAMP) as eventdate, 
  get_json_object(jsonentry, "$.userid") as userid, 
  get_json_object(jsonentry, "$.productid") as productid, 
  CAST(get_json_object(jsonentry, "$.quantity") as int) as quantity,
  CAST(get_json_object(jsonentry, "$.price") as int) as price, 
  year, 
  month, 
  day
FROM LogsRaw
WHERE year=${hiveconf:Year} and month=${hiveconf:Month} and day=${hiveconf:Day};