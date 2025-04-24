<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250416144819 extends AbstractMigration
{
    public function getDescription(): string
    {
        return ''; // Add description
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        // Look for lines like these and comment them out if 'restaurant_id' already exists

        // Example: If adding the column itself
        // $this->addSql('ALTER TABLE some_table ADD restaurant_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\'');

        // Example: If adding a foreign key constraint
        // $this->addSql('ALTER TABLE some_table ADD CONSTRAINT FK_SOMEHASH FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)');

        // Example: If adding an index
        // $this->addSql('CREATE INDEX IDX_SOMEHASH ON some_table (restaurant_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        // Look for the corresponding DROP statements and comment them out

        // Example: Dropping the foreign key
        // $this->addSql('ALTER TABLE some_table DROP FOREIGN KEY FK_SOMEHASH');

        // Example: Dropping the index
        // $this->addSql('DROP INDEX IDX_SOMEHASH ON some_table');

        // Example: Dropping the column
        // $this->addSql('ALTER TABLE some_table DROP restaurant_id');
    }
}
