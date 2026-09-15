-- DropIndex
DROP INDEX `ContentChange_reviewedBy_fkey` ON `contentchange`;

-- DropIndex
DROP INDEX `ContentChange_submittedBy_fkey` ON `contentchange`;

-- AlterTable
ALTER TABLE `contentitem` ADD COLUMN `clickCount` INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `ContentChange` ADD CONSTRAINT `ContentChange_contentItemId_fkey` FOREIGN KEY (`contentItemId`) REFERENCES `ContentItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentChange` ADD CONSTRAINT `ContentChange_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentChange` ADD CONSTRAINT `ContentChange_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
