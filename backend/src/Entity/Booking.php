<?php

namespace App\Entity;

use App\Repository\BookingRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use App\Entity\Restaurant;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\Table(name: 'bookings')]
#[ORM\HasLifecycleCallbacks]
class Booking
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Accommodation::class)]
    #[ORM\JoinColumn(name: 'accommodation_id', referencedColumnName: 'id', nullable: true)]
    private ?Accommodation $accommodation = null;

    #[ORM\ManyToOne(targetEntity: Experience::class)]
    #[ORM\JoinColumn(name: 'experience_id', referencedColumnName: 'id', nullable: true)]
    private ?Experience $experience = null;

    #[ORM\Column(type: 'date', name: 'check_in_date', nullable: true)]
    private ?\DateTimeInterface $checkInDate = null;

    #[ORM\Column(type: 'date', name: 'check_out_date')]
    private ?\DateTimeInterface $checkOutDate = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, name: 'total_price')]
    private ?string $totalPrice = null;

    #[ORM\Column(type: 'string', length: 20)]
    private ?string $status = null;

    #[ORM\Column(type: 'time', nullable: true)]
    private ?\DateTimeInterface $lunchTime = null;

    #[ORM\Column(type: 'string', length: 20, name: 'payment_status')]
    private ?string $paymentStatus = null;

    #[ORM\Column(type: 'datetime_immutable', name: 'created_at')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable', name: 'updated_at')]
    private ?\DateTimeImmutable $updatedAt = null;
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $notes = null;

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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

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

    public function getCheckInDate(): ?\DateTimeInterface
    {
        return $this->checkInDate;
    }

    public function setCheckInDate(\DateTimeInterface $checkInDate): self
    {
        $this->checkInDate = $checkInDate;

        return $this;
    }

    public function getCheckOutDate(): ?\DateTimeInterface
    {
        return $this->checkOutDate;
    }

    public function setCheckOutDate(\DateTimeInterface $checkOutDate): self
    {
        $this->checkOutDate = $checkOutDate;

        return $this;
    }

    public function getTotalPrice(): ?string
    {
        return $this->totalPrice;
    }

    public function setTotalPrice(string $totalPrice): self
    {
        $this->totalPrice = $totalPrice;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getPaymentStatus(): ?string
    {
        return $this->paymentStatus;
    }

    public function setPaymentStatus(string $paymentStatus): self
    {
        $this->paymentStatus = $paymentStatus;

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

    #[ORM\Column(type: 'integer')]
    private ?int $guestCount = null;

    #[ORM\Column]
    private ?int $rooms = null;

    public function getGuestCount(): ?int
    {
        return $this->guestCount;
    }
    
    public function setGuestCount(int $guestCount): self
    {
        $this->guestCount = $guestCount;
        
        return $this;
    }

    public function getRooms(): ?int
    {
        return $this->rooms;
    }

    public function setRooms(int $rooms): static
    {
        $this->rooms = $rooms;

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
    
    #[ORM\ManyToOne(targetEntity: Restaurant::class)]
    #[ORM\JoinColumn(name: 'restaurant_id', referencedColumnName: 'id', nullable: true)]
    private ?Restaurant $restaurant = null;

    public function getRestaurant(): ?Restaurant
    {
        return $this->restaurant;
    }

    public function setRestaurant(?Restaurant $restaurant): self
    {
        $this->restaurant = $restaurant;
        return $this;
    }
    public function getNotes(): ?string
    {
        return $this->notes;
    }
    
    public function setNotes(?string $notes): self
    {
        $this->notes = $notes;
        return $this;
    }
    // Add getter and setter for lunchTime after other getters and setters
    public function getLunchTime(): ?\DateTimeInterface
    {
        return $this->lunchTime;
    }

    public function setLunchTime(?\DateTimeInterface $lunchTime): self
    {
        $this->lunchTime = $lunchTime;
        return $this;
    }
}