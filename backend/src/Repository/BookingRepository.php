<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\User;
use App\Entity\Accommodation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Booking>
 *
 * @method Booking|null find($id, $lockMode = null, $lockVersion = null)
 * @method Booking|null findOneBy(array $criteria, array $orderBy = null)
 * @method Booking[]    findAll()
 * @method Booking[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    public function save(Booking $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Booking $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find bookings for a specific user
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.user = :user')
            ->setParameter('user', $user)
            ->orderBy('b.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find bookings for a specific accommodation
     */
    public function findByAccommodation(Accommodation $accommodation): array
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.accommodation = :accommodation')
            ->setParameter('accommodation', $accommodation)
            ->orderBy('b.checkInDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Check if an accommodation is available for the given dates
     */
    public function isAccommodationAvailable(Accommodation $accommodation, \DateTimeInterface $checkIn, \DateTimeInterface $checkOut): bool
    {
        $overlappingBookings = $this->createQueryBuilder('b')
            ->andWhere('b.accommodation = :accommodation')
            ->andWhere('b.status = :status')
            ->andWhere(
                '(b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn)'
            )
            ->setParameter('accommodation', $accommodation)
            ->setParameter('status', 'confirmed')
            ->setParameter('checkIn', $checkIn)
            ->setParameter('checkOut', $checkOut)
            ->getQuery()
            ->getResult();

        return count($overlappingBookings) === 0;
    }

    /**
     * Find bookings that overlap with the given date range for an accommodation
     */
    public function findOverlappingBookings(Accommodation $accommodation, \DateTimeInterface $checkInDate, \DateTimeInterface $checkOutDate)
    {
        return $this->createQueryBuilder('b')
            ->where('b.accommodation = :accommodation')
            ->andWhere('b.status != :cancelledStatus')
            ->andWhere(
                '(b.checkInDate <= :checkOutDate AND b.checkOutDate >= :checkInDate)'
            )
            ->setParameter('accommodation', $accommodation)
            ->setParameter('cancelledStatus', 'cancelled')
            ->setParameter('checkInDate', $checkInDate)
            ->setParameter('checkOutDate', $checkOutDate)
            ->getQuery()
            ->getResult();
    }
}