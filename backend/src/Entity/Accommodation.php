<?php

namespace App\Entity;

use App\Repository\AccommodationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: AccommodationRepository::class)]
#[ORM\Table(name: 'accommodations')]
#[ORM\HasLifecycleCallbacks]
class Accommodation
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'host_id', referencedColumnName: 'id', nullable: false)]
    private ?User $host = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: 'text')]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 50)]
    private ?string $type = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, name: 'price_per_night')]
    private ?string $pricePerNight = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 7, name: 'location_lat')]
    private ?string $locationLat = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 7, name: 'location_lng')]
    private ?string $locationLng = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $address = null;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $city = null;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $country = null;

    #[ORM\Column(type: 'json', name: 'amenities')]
    private array $amenities = [];

    #[ORM\Column(type: 'datetime_immutable', name: 'created_at')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable', name: 'updated_at')]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getHost(): ?User
    {
        return $this->host;
    }

    public function setHost(?User $host): self
    {
        $this->host = $host;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getPricePerNight(): ?string
    {
        return $this->pricePerNight;
    }

    public function setPricePerNight(string $pricePerNight): self
    {
        $this->pricePerNight = $pricePerNight;

        return $this;
    }

    public function getLocationLat(): ?string
    {
        return $this->locationLat;
    }

    public function setLocationLat(string $locationLat): self
    {
        $this->locationLat = $locationLat;

        return $this;
    }

    public function getLocationLng(): ?string
    {
        return $this->locationLng;
    }

    public function setLocationLng(string $locationLng): self
    {
        $this->locationLng = $locationLng;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): self
    {
        $this->address = $address;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(string $city): self
    {
        $this->city = $city;

        return $this;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(string $country): self
    {
        $this->country = $country;

        return $this;
    }

    public function getAmenities(): array
    {
        return $this->amenities;
    }

    public function setAmenities(array $amenities): self
    {
        $this->amenities = $amenities;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    // Añade este campo en la clase Accommodation
    
    #[ORM\Column(type: 'integer')]
    private ?int $maxGuests = null;
    
    // Y estos métodos
    public function getMaxGuests(): ?int
    {
        return $this->maxGuests;
    }
    
    public function setMaxGuests(int $maxGuests): self
    {
        $this->maxGuests = $maxGuests;
        
        return $this;
    }

    #[ORM\OneToMany(mappedBy: 'accommodation', targetEntity: Image::class, cascade: ['persist', 'remove'])]
    private Collection $images;

    public function __construct()
    {
        $this->images = new ArrayCollection();
        // ... inicialización existente ...
    }

    // ... métodos existentes ...

    /**
     * @return Collection<int, Image>
     */
    public function getImages(): Collection
    {
        return $this->images;
    }

    public function addImage(Image $image): self
    {
        if (!$this->images->contains($image)) {
            $this->images->add($image);
            $image->setAccommodation($this);
        }

        return $this;
    }

    public function removeImage(Image $image): self
    {
        if ($this->images->removeElement($image)) {
            // set the owning side to null (unless already changed)
            if ($image->getAccommodation() === $this) {
                $image->setAccommodation(null);
            }
        }

        return $this;
    }

    public function getFeaturedImage(): ?Image
    {
        foreach ($this->images as $image) {
            if ($image->isFeatured()) {
                return $image;
            }
        }
        
        // Si no hay imagen destacada, devolver la primera
        if (!$this->images->isEmpty()) {
            return $this->images->first();
        }
        
        return null;
    }
}