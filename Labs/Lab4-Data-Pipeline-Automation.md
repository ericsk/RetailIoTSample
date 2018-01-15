# Lab 4: Data Pipeline Automation (Orchestration)

在這個 Lab 中您將會學習到如何使用 Azure Data Factory 來將整個資料管線 (data pipeline) 串接起來並且排程執行。

## Step 1: 建立需要的 Azure 資源

這裡我們主要就是使用 [Azure Data Factory](https://azure.microsoft.com/services/data-factory/)，所以只需建立這個服務即可。而由於 Data Factory 只是編寫資料管線的定義以及驅動它執行，所以 **Data Factory 不必與資料管線建立在同一機房**。

在這個 lab 中我們使用 **V1** 的版本。

![建立 Azure Data Factory](images/creating_adf.png)

## Step 2: 編寫管線

這個步驟要來編寫資料管線的結構，在 Azure Data Factory 中都是以 JSON 格式來描述資料管線中的每一個元件。

### 編寫儲存體

首先，點擊面板中的**編寫與部署**的按鈕，然後點選**新資料存放區**，新增一個 _Azure 儲存體_ 來增加 blob storage 的設定，然後在右側的範本編輯器中填入：

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
在上述 `connectionString` 中要把帳號名稱以及金鑰換成存放資料的儲存體的資訊。填寫完畢再按下上方的**部署**。

接著，再新增一筆 Azure SQL Data Warehouse 的資料存放區，在範本編輯區輸入：

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
這裡一樣要把連線資訊換成在 Lab 3 所建立的 Azure SQL Data Warehouse 資訊。編寫完畢按下上方**部署**按鈕。

### 新增 on-demand HDInsight Cluster

在整個資料管線中，我們會使用 HDInsight 來做 ETL 的操作（詳見 [Lab 2](Lab2-Data-ETL.md)），但如果事先建好 HDInsight Cluster 又會在不需要執行的情況下浪費資源（以我們的使用情境，一天做一次就可以了），所幸我們可以利用 Data Factory 來建立 on-demand HDInsight Cluster，這樣就是只有在需要做 ETL 時才會把 HDInsight Cluster 建立起來執行，執行完畢後就會刪除，對於自動化以及節省成本來說有很大的好處。

只要在編寫管線中，新增一個計算資源，選擇**依需求的 HDInsight 叢集**，然後在範本編輯器裡填寫需要的規格，以及叢集生命長度。

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
這裡的範例是設定運作一個小時，並且使用先前設定好的 storage 來做為這個 hdinsight cluster 的儲存體。

編寫完畢後，按下**部署**完成。

