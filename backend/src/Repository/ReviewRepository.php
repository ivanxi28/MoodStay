<?php

namespace App\Repository;

use App\Entity\Review;
use App\Entity\User;
use App\Entity\Accommodation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Review>
 *
 * @method Review|null find($id, $lockMode = null, $lockVersion = null)
 * @method Review|null findOneBy(array $criteria, array $orderBy = null)
 * @method Review[]    findAll()
 * @method Review[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ReviewRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Review::class);
    }

    public function save(Review $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Review $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find reviews for a specific accommodation
     */
    public function findByAccommodation(Accommodation $accommodation): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.accommodation = :accommodation')
            ->setParameter('accommodation', $accommodation)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find reviews by a specific user
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.user = :user')
            ->setParameter('user', $user)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Calculate average rating for an accommodation
     */
    public function getAverageRatingForAccommodation(Accommodation $accommodation): ?float
    {
        $result = $this->createQueryBuilder('r')
            ->select('AVG(r.rating) as avgRating')
            ->andWhere('r.accommodation = :accommodation')
            ->setParameter('accommodation', $accommodation)
            ->getQuery()
            ->getSingleScalarResult();
        
        return $result ? (float)$result : null;
    }
}