-- CreateTable
CREATE TABLE `contractor` (
    `contractor_id` CHAR(36) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `middle_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `date_of_birth` DATETIME(3) NOT NULL,
    `email_address` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `country_of_residence` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`contractor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_detail` (
    `bank_detail_id` CHAR(36) NOT NULL,
    `contractor_id` CHAR(36) NOT NULL,
    `bank_name` VARCHAR(191) NOT NULL,
    `account_number` VARCHAR(191) NOT NULL,
    `IBAN` VARCHAR(191) NOT NULL,
    `SWIFT` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `bank_detail_contractor_id_IBAN_SWIFT_key`(`contractor_id`, `IBAN`, `SWIFT`),
    PRIMARY KEY (`bank_detail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visa_detail` (
    `visa_detail_id` CHAR(36) NOT NULL,
    `contractor_id` CHAR(36) NOT NULL,
    `visa_number` VARCHAR(191) NOT NULL,
    `visa_type` VARCHAR(191) NOT NULL,
    `visa_country` VARCHAR(191) NOT NULL,
    `visa_expiry_date` DATETIME(3) NOT NULL,
    `visa_status` ENUM('active', 'revoked', 'expired') NOT NULL,
    `visa_sponsor` VARCHAR(191) NOT NULL,
    `country_id_number` VARCHAR(191) NOT NULL,
    `country_id_type` ENUM('national_id', 'passport', 'other') NOT NULL,

    UNIQUE INDEX `visa_detail_contractor_id_visa_number_visa_country_key`(`contractor_id`, `visa_number`, `visa_country`),
    PRIMARY KEY (`visa_detail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client_company` (
    `client_company_id` CHAR(36) NOT NULL,
    `client_name` VARCHAR(191) NOT NULL,
    `contact_email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `client_company_contact_email_key`(`contact_email`),
    PRIMARY KEY (`client_company_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract` (
    `contract_id` CHAR(36) NOT NULL,
    `contractor_id` CHAR(36) NOT NULL,
    `client_company_id` CHAR(36) NOT NULL,
    `contract_start_date` DATETIME(3) NOT NULL,
    `contract_end_date` DATETIME(3) NOT NULL,
    `job_title` VARCHAR(191) NOT NULL,
    `job_type` VARCHAR(191) NOT NULL,
    `contract_status` ENUM('active', 'terminated', 'expired') NOT NULL,

    PRIMARY KEY (`contract_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_order` (
    `PO_id` CHAR(36) NOT NULL,
    `PO_start_date` DATETIME(3) NOT NULL,
    `PO_end_date` DATETIME(3) NOT NULL,
    `contract_id` CHAR(36) NOT NULL,
    `PO_total_value` DECIMAL(65, 30) NOT NULL,
    `PO_status` ENUM('active', 'cancelled', 'expired') NOT NULL,
    `kintec_email_for_remittance` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `purchase_order_contract_id_key`(`contract_id`),
    PRIMARY KEY (`PO_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rate` (
    `rate_id` CHAR(36) NOT NULL,
    `PO_id` CHAR(36) NOT NULL,
    `rate_type` ENUM('rate_to_man_day', 'charge_rate', 'allowance', 'travel_day', 'travel_day_charge_rate', 'overtime_rate_to_man', 'overtime_charge_rate', 'recruitment_lump_sum') NOT NULL,
    `rate_frequency` ENUM('hourly', 'monthly', 'daily') NOT NULL,
    `rate_value` DECIMAL(65, 30) NOT NULL,
    `rate_currency` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`rate_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice` (
    `invoice_id` CHAR(36) NOT NULL,
    `PO_id` CHAR(36) NOT NULL,
    `billing_period` DATETIME(3) NOT NULL,
    `invoice_status` ENUM('pending', 'paid') NOT NULL,
    `invoice_total_value` DECIMAL(65, 30) NOT NULL,
    `invoice_currency` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`invoice_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bank_detail` ADD CONSTRAINT `bank_detail_contractor_id_fkey` FOREIGN KEY (`contractor_id`) REFERENCES `contractor`(`contractor_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visa_detail` ADD CONSTRAINT `visa_detail_contractor_id_fkey` FOREIGN KEY (`contractor_id`) REFERENCES `contractor`(`contractor_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract` ADD CONSTRAINT `contract_contractor_id_fkey` FOREIGN KEY (`contractor_id`) REFERENCES `contractor`(`contractor_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract` ADD CONSTRAINT `contract_client_company_id_fkey` FOREIGN KEY (`client_company_id`) REFERENCES `client_company`(`client_company_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order` ADD CONSTRAINT `purchase_order_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contract`(`contract_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rate` ADD CONSTRAINT `rate_PO_id_fkey` FOREIGN KEY (`PO_id`) REFERENCES `purchase_order`(`PO_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_PO_id_fkey` FOREIGN KEY (`PO_id`) REFERENCES `purchase_order`(`PO_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
