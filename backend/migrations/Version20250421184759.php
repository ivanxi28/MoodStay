<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250421184759 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE `chat` (id INT AUTO_INCREMENT NOT NULL, customer_id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)', owner_id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)', restaurant_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', experience_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', accommodation_id BINARY(16) DEFAULT NULL COMMENT '(DC2Type:uuid)', created_at DATETIME NOT NULL, INDEX IDX_659DF2AA9395C3F3 (customer_id), INDEX IDX_659DF2AA7E3C61F9 (owner_id), INDEX IDX_659DF2AAB1E7706E (restaurant_id), INDEX IDX_659DF2AA46E90E27 (experience_id), INDEX IDX_659DF2AA8F3692CD (accommodation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE message (id INT AUTO_INCREMENT NOT NULL, chat_id INT NOT NULL, sender_id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)', content LONGTEXT NOT NULL, created_at DATETIME NOT NULL, is_read TINYINT(1) NOT NULL, INDEX IDX_B6BD307F1A9A7125 (chat_id), INDEX IDX_B6BD307FF624B39D (sender_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `chat` ADD CONSTRAINT FK_659DF2AA9395C3F3 FOREIGN KEY (customer_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `chat` ADD CONSTRAINT FK_659DF2AA7E3C61F9 FOREIGN KEY (owner_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `chat` ADD CONSTRAINT FK_659DF2AAB1E7706E FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE SET NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `chat` ADD CONSTRAINT FK_659DF2AA46E90E27 FOREIGN KEY (experience_id) REFERENCES experiences (id) ON DELETE SET NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `chat` ADD CONSTRAINT FK_659DF2AA8F3692CD FOREIGN KEY (accommodation_id) REFERENCES accommodations (id) ON DELETE SET NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE message ADD CONSTRAINT FK_B6BD307F1A9A7125 FOREIGN KEY (chat_id) REFERENCES `chat` (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE message ADD CONSTRAINT FK_B6BD307FF624B39D FOREIGN KEY (sender_id) REFERENCES users (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE `chat` DROP FOREIGN KEY FK_659DF2AA9395C3F3
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `chat` DROP FOREIGN KEY FK_659DF2AA7E3C61F9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `chat` DROP FOREIGN KEY FK_659DF2AAB1E7706E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `chat` DROP FOREIGN KEY FK_659DF2AA46E90E27
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `chat` DROP FOREIGN KEY FK_659DF2AA8F3692CD
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F1A9A7125
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE message DROP FOREIGN KEY FK_B6BD307FF624B39D
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE `chat`
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE message
        SQL);
    }
}
