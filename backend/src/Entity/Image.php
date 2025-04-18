<?php

namespace App\Entity;

use App\Repository\ImageRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ImageRepository::class)]
#[ORM\Table(name: 'images')]
#[ORM\HasLifecycleCallbacks]
class Image
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $filename = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $alt = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isFeatured = false;

    #[ORM\ManyToOne(targetEntity: Accommodation::class, inversedBy: 'images')]
    #[ORM\JoinColumn(name: 'accommodation_id', referencedColumnName: 'id', nullable: true)]
    private ?Accommodation $accommodation = null;

    #[ORM\ManyToOne(targetEntity: Experience::class, inversedBy: 'images')]
    #[ORM\JoinColumn(name: 'experience_id', referencedColumnName: 'id', nullable: true)]
    private ?Experience $experience = null;

    #[ORM\ManyToOne(targetEntity: Restaurant::class, inversedBy: 'images')]
    #[ORM\JoinColumn(name: 'restaurant_id', referencedColumnName: 'id', nullable: true)]
    private ?Restaurant $restaurant = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getFilename(): ?string
    {
        return $this->filename;
    }

    public function setFilename(string $filename): self
    {
        $this->filename = $filename;
        return $this;
    }

    public function getAlt(): ?string
    {
        return $this->alt;
    }

    public function setAlt(?string $alt): self
    {
        $this->alt = $alt;
        return $this;
    }

    public function isFeatured(): bool
    {
        return $this->isFeatured;
    }

    public function setIsFeatured(bool $isFeatured): self
    {
        $this->isFeatured = $isFeatured;
        return $this;
    }

    public function getAccommodation(): ?Accommodation
    {
        return $this->accommodation;
    }

    public function setAccommodation(?Accommodation $accommodation): self
    {
        $this->accommodation = $accommodation;
        return $this;
    }

    public function getExperience(): ?Experience
    {
        return $this->experience;
    }

    public function setExperience(?Experience $experience): self
    {
        $this->experience = $experience;
        return $this;
    }

    public function getRestaurant(): ?Restaurant
    {
        return $this->restaurant;
    }

    public function setRestaurant(?Restaurant $restaurant): self
    {
        $this->restaurant = $restaurant;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}