<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250415155736 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE bookings ADD experience_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', CHANGE accommodation_id accommodation_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', CHANGE check_in_date check_in_date DATE DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bookings ADD CONSTRAINT FK_7A853C3546E90E27 FOREIGN KEY (experience_id) REFERENCES experiences (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_7A853C3546E90E27 ON bookings (experience_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE bookings DROP FOREIGN KEY FK_7A853C3546E90E27
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_7A853C3546E90E27 ON bookings
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bookings DROP experience_id, CHANGE accommodation_id accommodation_id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)', CHANGE check_in_date check_in_date DATE NOT NULL
        SQL);
    }
}
