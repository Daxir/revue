-- CreateTable
CREATE TABLE "EventLog" (
    "event_log_id" SERIAL NOT NULL,
    "event_log_date" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("event_log_id")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
