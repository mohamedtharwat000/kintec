/*
  Warnings:

  - You are about to drop the column `PO_id` on the `contract` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `contract` DROP COLUMN `PO_id`,
    MODIFY `description_of_services` VARCHAR(191) NULL;
