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
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews ADD experience_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', ADD restaurant_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', CHANGE accommodation_id accommodation_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0F46E90E27 FOREIGN KEY (experience_id) REFERENCES experiences (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0FB1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6970EB0F46E90E27 ON reviews (experience_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6970EB0FB1E7706E ON reviews (restaurant_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews DROP FOREIGN KEY FK_6970EB0F46E90E27
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews DROP FOREIGN KEY FK_6970EB0FB1E7706E
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_6970EB0F46E90E27 ON reviews
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_6970EB0FB1E7706E ON reviews
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews DROP experience_id, DROP restaurant_id, CHANGE accommodation_id accommodation_id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)'
        SQL);
    }
}
