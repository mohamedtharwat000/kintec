/*
  Warnings:

  - The values [rate_to_man_day,charge_rate,allowance,travel_day,travel_day_charge_rate,overtime_rate_to_man,overtime_charge_rate,recruitment_lump_sum] on the enum `rate_rate_type` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `bank_detail_type` to the `bank_detail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `PO_id` to the `contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description_of_services` to the `contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_number` to the `contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kintec_cost_centre_code` to the `contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country_id_expiry_date` to the `visa_detail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country_id_status` to the `visa_detail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bank_detail` ADD COLUMN `bank_detail_type` ENUM('intermediary', 'primary') NOT NULL;

-- AlterTable
ALTER TABLE `client_company` ADD COLUMN `invoice_submission_deadline` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `contract` ADD COLUMN `PO_id` CHAR(36) NOT NULL,
    ADD COLUMN `description_of_services` VARCHAR(191) NOT NULL,
    ADD COLUMN `job_number` VARCHAR(191) NOT NULL,
    ADD COLUMN `kintec_cost_centre_code` VARCHAR(191) NOT NULL,
    ADD COLUMN `project_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `rate` MODIFY `rate_type` ENUM('charged', 'paid') NOT NULL;

-- AlterTable
ALTER TABLE `visa_detail` ADD COLUMN `country_id_expiry_date` DATETIME(3) NOT NULL,
    ADD COLUMN `country_id_status` ENUM('active', 'revoked', 'expired') NOT NULL;

-- CreateTable
CREATE TABLE `project` (
    `project_id` CHAR(36) NOT NULL,
    `project_name` VARCHAR(191) NOT NULL,
    `project_type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`project_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_rule` (
    `project_rule_id` CHAR(36) NOT NULL,
    `project_id` CHAR(36) NOT NULL,
    `special_project_rules` VARCHAR(191) NULL,
    `project_rules_reviewer_name` VARCHAR(191) NULL,
    `additional_review_process` ENUM('required', 'not_required') NULL,
    `major_project_indicator` BOOLEAN NULL,

    PRIMARY KEY (`project_rule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RPO_rule` (
    `RPO_rule_id` CHAR(36) NOT NULL,
    `PO_id` CHAR(36) NOT NULL,
    `RPO_number_format` VARCHAR(191) NULL,
    `final_invoice_label` VARCHAR(191) NULL,
    `RPO_extension_handling` VARCHAR(191) NULL,
    `mob_demob_fee_rules` VARCHAR(191) NULL,

    PRIMARY KEY (`RPO_rule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense` (
    `expense_id` CHAR(36) NOT NULL,
    `PO_id` CHAR(36) NOT NULL,
    `expense_type` ENUM('charged', 'paid') NOT NULL,
    `expense_frequency` ENUM('hourly', 'monthly', 'daily') NOT NULL,
    `expense_value` DECIMAL(65, 30) NOT NULL,
    `expsense_currency` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`expense_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense_validation_rule` (
    `exp_val_rule_id` CHAR(36) NOT NULL,
    `expense_id` CHAR(36) NOT NULL,
    `allowable_expense_types` VARCHAR(191) NULL,
    `expense_documentation` VARCHAR(191) NULL,
    `supporting_documentation_type` VARCHAR(191) NULL,
    `expense_limit` VARCHAR(191) NULL,
    `reimbursement_rule` VARCHAR(191) NULL,

    PRIMARY KEY (`exp_val_rule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `common_rejection` (
    `common_rejection_id` CHAR(36) NOT NULL,
    `common_rejection_type` ENUM('contractor', 'client') NOT NULL,
    `resolution_process` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`common_rejection_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission` (
    `submission_id` CHAR(36) NOT NULL,
    `contractor_id` CHAR(36) NOT NULL,
    `PO_id` CHAR(36) NOT NULL,
    `billing_period` DATETIME(3) NOT NULL,
    `payment_currency` VARCHAR(191) NOT NULL,
    `invoice_currency` VARCHAR(191) NOT NULL,
    `invoice_due_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`submission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission_validation_rule` (
    `sub_val_rule_id` CHAR(36) NOT NULL,
    `submission_id` CHAR(36) NOT NULL,
    `approval_signature_rules` VARCHAR(191) NULL,
    `approval_date_rules` VARCHAR(191) NULL,
    `required_fields` ENUM('REG', 'EXP') NULL,
    `template_requirements` VARCHAR(191) NULL,
    `workday_definitions` VARCHAR(191) NULL,

    PRIMARY KEY (`sub_val_rule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review` (
    `review_id` CHAR(36) NOT NULL,
    `submission_id` CHAR(36) NOT NULL,
    `special_review_required` BOOLEAN NOT NULL,
    `reviewer_name` VARCHAR(191) NOT NULL,
    `review_status` ENUM('pending', 'approved', 'rejected') NOT NULL,
    `review_timestamp` DATETIME(3) NOT NULL,
    `review_rejection_reason` VARCHAR(191) NULL,
    `overall_validation_status` ENUM('approved', 'rejected') NOT NULL,
    `last_overall_validation_date` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_formatting_rule` (
    `inv_formatting_rule_id` CHAR(36) NOT NULL,
    `invoice_id` CHAR(36) NOT NULL,
    `file_format` VARCHAR(191) NULL,
    `required_invoice_fields` VARCHAR(191) NULL,
    `attachment_requirements` VARCHAR(191) NULL,

    PRIMARY KEY (`inv_formatting_rule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contract` ADD CONSTRAINT `contract_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`project_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_rule` ADD CONSTRAINT `project_rule_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`project_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RPO_rule` ADD CONSTRAINT `RPO_rule_PO_id_fkey` FOREIGN KEY (`PO_id`) REFERENCES `purchase_order`(`PO_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense` ADD CONSTRAINT `expense_PO_id_fkey` FOREIGN KEY (`PO_id`) REFERENCES `purchase_order`(`PO_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense_validation_rule` ADD CONSTRAINT `expense_validation_rule_expense_id_fkey` FOREIGN KEY (`expense_id`) REFERENCES `expense`(`expense_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_contractor_id_fkey` FOREIGN KEY (`contractor_id`) REFERENCES `contractor`(`contractor_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_PO_id_fkey` FOREIGN KEY (`PO_id`) REFERENCES `purchase_order`(`PO_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_validation_rule` ADD CONSTRAINT `submission_validation_rule_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submission`(`submission_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submission`(`submission_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_formatting_rule` ADD CONSTRAINT `invoice_formatting_rule_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`invoice_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
