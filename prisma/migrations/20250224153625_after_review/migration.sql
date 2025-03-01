/*
  Warnings:

  - The values [intermediary] on the enum `bank_detail_bank_detail_type` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `last_updated` to the `bank_detail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pro_rata_percentage` to the `expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_type` to the `invoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `expense` DROP FOREIGN KEY `expense_PO_id_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `invoice_PO_id_fkey`;

-- DropForeignKey
ALTER TABLE `rate` DROP FOREIGN KEY `rate_PO_id_fkey`;

-- DropForeignKey
ALTER TABLE `submission` DROP FOREIGN KEY `submission_PO_id_fkey`;

-- DropIndex
DROP INDEX `expense_PO_id_fkey` ON `expense`;

-- DropIndex
DROP INDEX `invoice_PO_id_fkey` ON `invoice`;

-- DropIndex
DROP INDEX `rate_PO_id_fkey` ON `rate`;

-- DropIndex
DROP INDEX `submission_PO_id_fkey` ON `submission`;

-- AlterTable
ALTER TABLE `bank_detail` ADD COLUMN `bank_detail_validated` BOOLEAN NULL,
    ADD COLUMN `last_updated` DATETIME(3) NOT NULL,
    MODIFY `bank_detail_type` ENUM('primary', 'secondary') NOT NULL;

-- AlterTable
ALTER TABLE `expense` ADD COLUMN `CWO_id` CHAR(36) NULL,
    ADD COLUMN `pro_rata_percentage` DOUBLE NOT NULL,
    MODIFY `PO_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `CWO_id` CHAR(36) NULL,
    ADD COLUMN `external_assignment` BOOLEAN NULL,
    ADD COLUMN `invoice_type` ENUM('proforma', 'sales') NOT NULL,
    ADD COLUMN `wht_applicable` BOOLEAN NULL,
    ADD COLUMN `wht_rate` DOUBLE NULL,
    MODIFY `PO_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `rate` ADD COLUMN `CWO_id` CHAR(36) NULL,
    MODIFY `PO_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `submission` ADD COLUMN `CWO_id` CHAR(36) NULL,
    ADD COLUMN `external_assignment` BOOLEAN NULL,
    ADD COLUMN `wht_applicable` BOOLEAN NULL,
    ADD COLUMN `wht_rate` DOUBLE NULL,
    MODIFY `PO_id` CHAR(36) NULL;

-- CreateTable
CREATE TABLE `calloff_work_order` (
    `CWO_id` CHAR(36) NOT NULL,
    `CWO_start_date` DATETIME(3) NOT NULL,
    `CWO_end_date` DATETIME(3) NOT NULL,
    `contract_id` VARCHAR(191) NOT NULL,
    `CWO_total_value` DECIMAL(65, 30) NOT NULL,
    `CWO_status` ENUM('active', 'cancelled', 'expired') NOT NULL,
    `kintec_email_for_remittance` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`CWO_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CWO_rule` (
    `CWO_rule_id` CHAR(36) NOT NULL,
    `CWO_id` CHAR(36) NOT NULL,
    `CWO_number_format` VARCHAR(191) NULL,
    `final_invoice_label` VARCHAR(191) NULL,
    `CWO_extension_handling` VARCHAR(191) NULL,
    `mob_demob_fee_rules` VARCHAR(191) NULL,

    PRIMARY KEY (`CWO_rule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `calloff_work_order` ADD CONSTRAINT `calloff_work_order_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contract`(`contract_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CWO_rule` ADD CONSTRAINT `CWO_rule_CWO_id_fkey` FOREIGN KEY (`CWO_id`) REFERENCES `calloff_work_order`(`CWO_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rate` ADD CONSTRAINT `rate_PO_id_fkey` FOREIGN KEY (`PO_id`) REFERENCES `purchase_order`(`PO_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rate` ADD CONSTRAINT `rate_CWO_id_fkey` FOREIGN KEY (`CWO_id`) REFERENCES `calloff_work_order`(`CWO_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense` ADD CONSTRAINT `expense_PO_id_fkey` FOREIGN KEY (`PO_id`) REFERENCES `purchase_order`(`PO_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense` ADD CONSTRAINT `expense_CWO_id_fkey` FOREIGN KEY (`CWO_id`) REFERENCES `calloff_work_order`(`CWO_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_PO_id_fkey` FOREIGN KEY (`PO_id`) REFERENCES `purchase_order`(`PO_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_CWO_id_fkey` FOREIGN KEY (`CWO_id`) REFERENCES `calloff_work_order`(`CWO_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_PO_id_fkey` FOREIGN KEY (`PO_id`) REFERENCES `purchase_order`(`PO_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_CWO_id_fkey` FOREIGN KEY (`CWO_id`) REFERENCES `calloff_work_order`(`CWO_id`) ON DELETE SET NULL ON UPDATE CASCADE;
