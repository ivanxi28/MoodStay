<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250415161921 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE restaurants (id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)', owner_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', name VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, address VARCHAR(255) NOT NULL, city VARCHAR(100) NOT NULL, country VARCHAR(100) NOT NULL, postal_code VARCHAR(20) DEFAULT NULL, phone VARCHAR(20) DEFAULT NULL, email VARCHAR(255) DEFAULT NULL, website VARCHAR(255) DEFAULT NULL, latitude NUMERIC(10, 7) DEFAULT NULL, longitude NUMERIC(10, 7) DEFAULT NULL, cuisine VARCHAR(100) NOT NULL, rating NUMERIC(3, 1) DEFAULT NULL, price_range NUMERIC(10, 2) DEFAULT NULL, opening_hours JSON DEFAULT NULL COMMENT '(DC2Type:json)', is_active TINYINT(1) NOT NULL, images JSON DEFAULT NULL COMMENT '(DC2Type:json)', created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_AD8377247E3C61F9 (owner_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE restaurants ADD CONSTRAINT FK_AD8377247E3C61F9 FOREIGN KEY (owner_id) REFERENCES users (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE restaurants DROP FOREIGN KEY FK_AD8377247E3C61F9
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE restaurants
        SQL);
    }
}
