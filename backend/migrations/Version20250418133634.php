<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250418133634 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE images (id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)', accommodation_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', experience_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', restaurant_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', filename VARCHAR(255) NOT NULL, alt VARCHAR(255) DEFAULT NULL, is_featured TINYINT(1) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_E01FBE6A8F3692CD (accommodation_id), INDEX IDX_E01FBE6A46E90E27 (experience_id), INDEX IDX_E01FBE6AB1E7706E (restaurant_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE images ADD CONSTRAINT FK_E01FBE6A8F3692CD FOREIGN KEY (accommodation_id) REFERENCES accommodations (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE images ADD CONSTRAINT FK_E01FBE6A46E90E27 FOREIGN KEY (experience_id) REFERENCES experiences (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE images ADD CONSTRAINT FK_E01FBE6AB1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE restaurants DROP images
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE images DROP FOREIGN KEY FK_E01FBE6A8F3692CD
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE images DROP FOREIGN KEY FK_E01FBE6A46E90E27
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE images DROP FOREIGN KEY FK_E01FBE6AB1E7706E
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE images
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE restaurants ADD images JSON DEFAULT NULL COMMENT '(DC2Type:json)'
        SQL);
    }
}
