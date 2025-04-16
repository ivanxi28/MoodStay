<?php

namespace App\Repository;

use App\Entity\Accommodation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Accommodation>
 *
 * @method Accommodation|null find($id, $lockMode = null, $lockVersion = null)
 * @method Accommodation|null findOneBy(array $criteria, array $orderBy = null)
 * @method Accommodation[]    findAll()
 * @method Accommodation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AccommodationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Accommodation::class);
    }

    public function save(Accommodation $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Accommodation $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find accommodations by search criteria
     */
    public function findBySearchCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('a');
        
        if (!empty($criteria['city'])) {
            $qb->andWhere('LOWER(a.city) LIKE LOWER(:city)')
               ->setParameter('city', '%' . $criteria['city'] . '%');
        }
        
        if (!empty($criteria['country'])) {
            $qb->andWhere('LOWER(a.country) LIKE LOWER(:country)')
               ->setParameter('country', '%' . $criteria['country'] . '%');
        }
        
        if (!empty($criteria['type'])) {
            $qb->andWhere('a.type = :type')
               ->setParameter('type', $criteria['type']);
        }
        
        if (!empty($criteria['min_price'])) {
            $qb->andWhere('a.pricePerNight >= :min_price')
               ->setParameter('min_price', $criteria['min_price']);
        }
        
        if (!empty($criteria['max_price'])) {
            $qb->andWhere('a.pricePerNight <= :max_price')
               ->setParameter('max_price', $criteria['max_price']);
        }
        
        // Order by price (default ascending)
        $direction = !empty($criteria['sort_direction']) && $criteria['sort_direction'] === 'desc' ? 'DESC' : 'ASC';
        $qb->orderBy('a.pricePerNight', $direction);
        
        return $qb->getQuery()->getResult();
    }
}