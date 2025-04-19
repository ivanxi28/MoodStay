<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250419101307 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE bookings ADD lunch_time TIME DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE experiences ADD CONSTRAINT FK_82020E701FB8D185 FOREIGN KEY (host_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_82020E701FB8D185 ON experiences (host_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE restaurants DROP rating
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE bookings DROP lunch_time
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE experiences DROP FOREIGN KEY FK_82020E701FB8D185
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_82020E701FB8D185 ON experiences
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE restaurants ADD rating NUMERIC(3, 1) DEFAULT NULL
        SQL);
    }
}
