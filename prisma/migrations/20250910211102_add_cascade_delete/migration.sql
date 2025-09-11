-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_sessionId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
