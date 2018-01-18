# Lab 4: Data Pipeline Automation (Orchestration)

在這個 Lab 中您將會學習到如何使用 Azure Data Factory 來將整個資料管線 (data pipeline) 串接起來並且排程執行。

## Step 1: 建立需要的 Azure 資源

這裡我們主要就是使用 [Azure Data Factory](https://azure.microsoft.com/services/data-factory/)，所以只需建立這個服務即可。而由於 Data Factory 只是編寫資料管線的定義以及驅動它執行，所以 **Data Factory 不必與資料管線建立在同一機房**。

在這個 lab 中我們使用 **V1** 的版本。

![建立 Azure Data Factory](images/creating_adf.png)

## Step 2: 編寫管線

這個步驟要來編寫資料管線的結構，在 Azure Data Factory 中都是以 JSON 格式來描述資料管線中的每一個元件。

### 編寫儲存體

首先，點擊面板中的**編寫與部署**的按鈕，然後點選**新資料存放區**，新增一個 _Azure 儲存體_ 來增加 blob storage 的設定，然後在右側的範本編輯器中填入：

   ```json
   {
       "name": "AzureStorageLinkedService",
       "properties": {
           "description": "",
           "hubName": "skretaildf_hub",
           "type": "AzureStorage",
           "typeProperties": {
               "connectionString": "DefaultEndpointsProtocol=https;AccountName=example;AccountKey=**********"
           }
       }
   }
   ```
在上述 `connectionString` 中要把帳號名稱以及金鑰換成存放資料的儲存體的資訊。填寫完畢再按下上方的**部署**。

接著，再新增一筆 Azure SQL Data Warehouse 的資料存放區，在範本編輯區輸入：

   ```json
   {
       "name": "AzureSqlDWLinkedService",
       "properties": {
           "description": "",
           "hubName": "skretaildf_hub",
           "type": "AzureSqlDW",
           "typeProperties": {
               "connectionString": "Data Source=tcp:skretail.database.windows.net,1433;Initial Catalog=skretaildw;Integrated Security=False;User ID=skretail;Password=**********;Connect Timeout=30;Encrypt=True"
           }
       }
   }
   ```

這裡一樣要把連線資訊換成在 Lab 3 所建立的 Azure SQL Data Warehouse 資訊。編寫完畢按下上方**部署**按鈕。

### 新增依需求的 HDInsight Cluster

在整個資料管線中，我們會使用 HDInsight 來做 ETL 的操作（詳見 [Lab 2](Lab2-Data-ETL.md)），但如果事先建好 HDInsight Cluster 又會在不需要執行的情況下浪費資源（以我們的使用情境，一天做一次就可以了），所幸我們可以利用 Data Factory 來建立 on-demand HDInsight Cluster，這樣就是只有在需要做 ETL 時才會把 HDInsight Cluster 建立起來執行，執行完畢後就會刪除，對於自動化以及節省成本來說有很大的好處。

只要在編寫管線中，新增一個計算資源，選擇**依需求的 HDInsight 叢集**，然後在範本編輯器裡填寫需要的規格，以及叢集生命長度。

   ```json
   {
       "name": "HDInsightOnDemandLinkedService",
       "properties": {
           "type": "HDInsightOnDemand",
           "description": "",
           "typeProperties": {
               "clusterSize": 4,
               "timeToLive": "01:00:00",
               "osType": "Linux",
               "version": "3.6",
               "linkedServiceName": "AzureStorageLinkedService"
           }
       }
   }
   ```
這裡的範例是設定運作一個小時，並且使用先前設定好的 storage 來做為這個 hdinsight cluster 的儲存體。

編寫完畢後，按下**部署**完成。

### 編寫資料管線的輸入及輸出

設定好資源，接下來就是設定資料管線的「流程」，首先是指定輸入的內容，這個部份是在告訴資料管線要去哪裡把資料送進來，在 Data Factory 中新增一個 _Azure Blob Storage_ 的 **資料集**：

   ```json
   {
       "name": "RawJsonData",
       "properties": {
           "type": "AzureBlob",
           "linkedServiceName": "AzureStorageLinkedService",
           "typeProperties": {
               "folderPath": "logs/{Year}/{Month}/{Day}",
               "partitionedBy": [
                   { "name": "Year", "value": { "type": "DateTime", "date": "SliceStart", "format": "yyyy" } },
                   { "name": "Month", "value": { "type": "DateTime", "date": "SliceStart", "format": "MM" } }, 
                   { "name": "Day", "value": { "type": "DateTime", "date": "SliceStart", "format": "dd" } }
               ],
               "format": {
                   "type": "JsonFormat"
               }
           },
           "availability": {
               "frequency": "Day",
               "interval": 1
           },
           "external": true
       }
   }
   ```

這裡指定了存放在 Azure Blob Storage 原始資料的格式，稍候我們便會利用這個資料集做為管線的輸入。

編寫完畢後按下上方的**部署**按鈕。

而相對的，還要再新增一個 _Azure Blob Storage_ 的**資料集**，做為預期的資料管線輸出結果：

   ```json
   {
       "name": "StoreActivityBlob",
       "properties": {
           "type": "AzureBlob",
           "linkedServiceName": "AzureStorageLinkedService",
           "structure": [
               {
                   "name": "eventdate",
                   "type": "Datetime"
               },
               {
                   "name": "userid",
                   "type": "String"
               },
               {
                   "name": "productid",
                   "type": "String"
               },
               {
                   "name": "quantity",
                   "type": "Int32"
               },
               {
                   "name": "price",
                   "type": "Int32"
               }
           ],
           "typeProperties": {
               "folderPath": "processeddata/structuredlogs/{Year}/{Month}/{Day}",
               "partitionedBy": [
                   { "name": "Year", "value": { "type": "DateTime", "date": "SliceStart", "format": "yyyy" } },
                   { "name": "Month", "value": { "type": "DateTime", "date": "SliceStart", "format": "MM" } }, 
                   { "name": "Day", "value": { "type": "DateTime", "date": "SliceStart", "format": "dd" } }
               ],
               "format": {
                   "type": "TextFormat",
                   "columnDelimiter": ","
               }
           },
           "availability": {
               "frequency": "Day",
               "interval": 1
           }
       }
   }
   ```

接著再新增一個 `DummyDataset` 的資料集，做為 hive query 之間的 placeholder：

   ```json
   {
        "name": "DummyDataset",
        "properties": {
            "published": false,
            "type": "AzureBlob",
            "linkedServiceName": "AzureStorageLinkedService",
            "typeProperties": {
                "folderPath": "dummy",
                "format": {
                    "type": "TextFormat"
                }
            },
            "availability": {
                "frequency": "Day",
                "interval": 1
            }
        }
    }
   ```

如果希望在資料管線 ETL 後的結果是放在 SQL Data Warehouse 中，那就要再加一筆 SQL DW 的**資料集**：

   ```json
   {
       "name": "StoreActivitySQL",
       "properties": {
           "type": "AzureSqlDWTable",
           "linkedServiceName": "AzureSqlDWLinkedService",
           "structure": [
               {
                   "name": "EventDate",
                   "type": "Datetime"
               },
               {
                   "name": "UserId",
                   "type": "String"
               },
               {
                   "name": "ProductId",
                   "type": "String"
               },
               {
                   "name": "Quantity",
                   "type": "Int32"
               },
               {
                   "name": "Price",
                   "type": "Int32"
               }
           ],
           "typeProperties": {
               "tableName": "adw.FactStoreActivity"
           },
           "availability": {
               "frequency": "Day",
               "interval": 1
           }
       }
   }
   ```

### 編寫管線

資料集與資料輸入輸出都準備好了之後，就可以來編寫**資料管線**了，在編寫的介面中加入一筆**管線**，然後在範本編輯器中填入：

   ```json
   {
       "name": "HadoopPipeline",
       "properties": {
           "description": "資料轉換的管線",
           "activities": [{
               "type": "HDInsightHive",
               "typeProperties": {
                   "scriptPath": "scripts\\addpartitions.hql",
                   "scriptLinkedService": "AzureStorageLinkedService",
                   "defines": {
                       "StorageAccountName": "skretailstore",
                       "Year": "$$Text.Format('{0:yyyy}',SliceStart)",
                       "Month": "$$Text.Format('{0:MM}',SliceStart)",
                       "Day": "$$Text.Format('{0:dd}',SliceStart)"
                   }
               },
               "inputs": [{
                   "name": "RawJsonData"
               }],
               "outputs": [{
                   "name": "DummyDataset"
               }],
               "policy": {
                   "timeout": "01:00:00",
                   "concurrency": 1,
                   "retry": 3
               },
               "scheduler": {
                   "frequency": "Day",
                   "interval": 1
               },
               "name": "CreatePartitionHiveActivity",
               "linkedServiceName": "HDInsightOnDemandLinkedService"
           }, {
               "type": "HDInsightHive",
               "typeProperties": {
                   "scriptPath": "scripts\\structuredlogs.hql",
                   "scriptLinkedService": "AzureStorageLinkedService",
                   "defines": {
                       "Year": "$$Text.Format('{0:yyyy}',SliceStart)",
                       "Month": "$$Text.Format('{0:MM}',SliceStart)",
                       "Day": "$$Text.Format('{0:dd}',SliceStart)"
                   }
               },
               "inputs": [{
                   "name": "DummyDataset"
               }],
               "outputs": [{
                   "name": "StoreActivityBlob"
               }],
               "policy": {
                   "timeout": "01:00:00",
                   "concurrency": 1,
                   "retry": 3
               },
               "scheduler": {
                   "frequency": "Day",
                   "interval": 1
               },
               "name": "ProcessDataHiveActivity",
               "linkedServiceName": "HDInsightOnDemandLinkedService"
           }],
           "start": "2018-01-01T00:00:00Z",
           "end": "2018-01-31T00:00:00Z"
       }
   }
   ```

這裡會看到有兩個 _活動 (activity)_，分別對應到兩個 hive query，這裡我們把 hive query 存成 hql 檔案然後放在 blob storage 裡，如此一來就可以直接指定要執行的 hive query。

部建完成後，你可以在 Data Factory 的面板中點選 **監視及管理** 看到圖像化的資料管線：

![](images/datapipeline.png)

而且可以在其中 `HadoopPipeline` 按右鍵開啟看到更細部的活動：

![](images/datapipeline_activity.png)