CREATE SCHEMA [adw]
GO

CREATE TABLE adw.FactStoreActivity
WITH (
  CLUSTERED COLUMNSTORE INDEX,
  DISTRIBUTION = HASH(ProductId)
)
AS
SELECT
  EventDate,
  UserId,
  ProductId,
  Quantity,
  Price
FROM asb.StoreActivityExternal
GO