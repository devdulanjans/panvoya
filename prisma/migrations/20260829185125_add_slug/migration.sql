-- AlterTable
ALTER TABLE `ContentItem` ADD COLUMN `slug` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ContentItem_slug_key` ON `ContentItem`(`slug`);
