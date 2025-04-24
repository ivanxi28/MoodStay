<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250416120842 extends AbstractMigration
{
    public function getDescription(): string
    {
        return ''; // Add a description if you like
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

        // Modified the first ALTER TABLE: Removed ADD restaurant_id as well
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews CHANGE accommodation_id accommodation_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)'
        SQL);

        // Commented out the lines adding the foreign key and index for experience_id (already done)
        // $this->addSql(<<<'SQL'
        //     ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0F46E90E27 FOREIGN KEY (experience_id) REFERENCES experiences (id)
        // SQL);

        // Commented out the lines adding the foreign key for restaurant_id
        // $this->addSql(<<<'SQL'
        //     ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0FB1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
        // SQL);

        // Commented out the line creating the index for experience_id (already done)
        // $this->addSql(<<<'SQL'
        //     CREATE INDEX IDX_6970EB0F46E90E27 ON reviews (experience_id)
        // SQL);

        // Commented out the line creating the index for restaurant_id
        // $this->addSql(<<<'SQL'
        //     CREATE INDEX IDX_6970EB0FB1E7706E ON reviews (restaurant_id)
        // SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

        // Commented out the line dropping the foreign key for experience_id (already done)
        // $this->addSql(<<<'SQL'
        //     ALTER TABLE reviews DROP FOREIGN KEY FK_6970EB0F46E90E27
        // SQL);

        // Commented out the line dropping the foreign key for restaurant_id
        // $this->addSql(<<<'SQL'
        //     ALTER TABLE reviews DROP FOREIGN KEY FK_6970EB0FB1E7706E
        // SQL);

        // Commented out the line dropping the index for experience_id (already done)
        // $this->addSql(<<<'SQL'
        //     DROP INDEX IDX_6970EB0F46E90E27 ON reviews
        // SQL);

        // Commented out the line dropping the index for restaurant_id
        // $this->addSql(<<<'SQL'
        //     DROP INDEX IDX_6970EB0FB1E7706E ON reviews
        // SQL);

        // Modified the final ALTER TABLE: Removed DROP restaurant_id as well
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews CHANGE accommodation_id accommodation_id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)'
        SQL);
    }
}
