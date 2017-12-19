# Lab 1: Data Ingestion

在這份 lab 中，您將會瞭解並建立蒐集資料 (data ingestion) 的基礎建設。

## Step 1: 建立需要的 Azure 服務

為了完成資料的蒐集，我們需要建立下列 Azure 服務：

  * [Azure IoT Hub](https://azure.microsoft.com/services/iot-hub/): 用來註冊驗證連線裝置，並且成為裝置到雲端 (device to cloud) 的入口。
  * [Azure Cosmos DB](https://azure.microsoft.com/services/cosmos-db/): 使用 NoSQL 資料儲存來存放裝置的驗證資訊 (e.g., 金鑰)。
  * [Azure Storage](https://azure.microsoft.com/services/storage/blobs/): 用來存放查詢資料以及儲存原始資料。
  * [Azure Stream Analytics](https://azure.microsoft.com/services/stream-analytics/): 用來近即時 (near real-time) 處理送到 IoT Hub 中的資料。
  * (選擇性) [Power BI](https://powerbi.microsoft.com/) 帳號: 用來呈現即時資訊。

以下是建立資源的步驟以及建議選項。

1. 進入 Azure 管理介面，新增一個 **IoT Hub 的資源**，注意在做 lab 或開發測試時定價層可以選擇**F1 - 免費**，不影響功能差異。

    > 地區建議選擇東南亞 (southeast asia)

2. 建立一個 **Azure Cosmos DB** 的資源，API 選擇 _SQL_，位置選擇與 IoT Hub 相同的資料中心即可。

    > 這裡選 SQL 的原因是因為模擬假資料的程式是基於 Document DB 所撰寫，您可以根據自己的需求再做調整。

3. 接著建立一個 **Azure Storage (儲存體帳戶)** 的資源，帳戶種類選擇 _StorageV1 (一般用途)_ 或 _StorageV2 (一般用途 v2)_ 皆可；複寫可以先選 _LRS_；位置別忘了要與 IoT Hub 相同。

    > StorageV1 有最好的相容性，而 StorageV2 可以有更多的功能，像是支援切換存放冷熱區、搭配虛擬網路等。

4. 最後再建立一個 **Azure Stream Analytics (串流分析)** 的資源，位置與 IoT Hub 及儲存體相同，而主控環境選擇 _雲端_。

## Step 2: 執行資料產生程式

1. 打開 _POSSimulator_ 目錄下的 _config.ts_ 檔案，填入下列資訊：

    * `iothub` 部份，在 `host` 的部份填入 IoT Hub 的主機名稱，根據先前建立的內容填入 (格式為 _xxxx.azure-devices.net_)；而金鑰選擇 IoT Hub 中的 _共用存取原則_ 中的 _iothubowner_ 可取得金鑰。

    * `docdb` 部份，填入 Cosmos DB 的文件端點，根據先前建立 Cosmos DB 的內容填入 (格式為 _https://xxxx.documents.azure.com:443/)，以及鑰即可。

2. 在 _POSSimulator_ 下開啟終端機 (或是開啟終端機切換到該目錄)，然後依序輸入下列指令開始執行模擬器：

    ```
    > npm install
    ....
    ....
    > npm run start
    ....
    ```
    
   如果看到有 _Message enqueued_ 的訊息，就表示訊息已經順利傳入 IoT Hub 了。

## Step 3: 設定串流分析的處理

1. 在串流分析的管理頁面中，選擇 **輸入** 加入一筆 IoT Hub 的輸入，建立資料：

    * 別名可以設定 _DataInput_ 
    * 來源類型 _Data Stream (資料流)_
    * 來源 _Iot Hub (IoT 中心)_
    * 匯入選項中選擇剛才建立的 IoT Hub
    * 端點 _傳訊_
    * 共用存取原則名稱 _iothubowner_
    * 其餘保留預設值

2. 然後再到 **輸出** 加入一筆 IoT Hub 的輸出，建立資料：

    * 別名可以設定 _RawData_
    * 接收 _Blob Storage (Blob 儲存體)_
    * 匯入選項中選擇剛才建立的儲存體帳戶
    * 容器可建立一個 _logs_
    * 路徑模式填入 _{date}_
    * 其餘保留預設值

3. 最後新增一筆查詢，內容填入：

    ```
    SELECT 
        eventDate, userId, productId, quantity, price 
    INTO
        RawData
    FROM 
        DataInput 
    TIMESTAMP BY 
        eventDate
    ```

4. 按下**開始**啟動串流分析的工作。


## Check Point

觀察訊息是否有正確地被存入 Storage 中。

## 下一步

如果這個 lab 沒有問題了，就可以進入到 [Lab 2: Data ETL](Lab2-Data-ETL.md) 的部份。