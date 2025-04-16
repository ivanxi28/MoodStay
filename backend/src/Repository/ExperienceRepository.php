<?php

namespace App\Repository;

use App\Entity\Experience;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Experience>
 *
 * @method Experience|null find($id, $lockMode = null, $lockVersion = null)
 * @method Experience|null findOneBy(array $criteria, array $orderBy = null)
 * @method Experience[]    findAll()
 * @method Experience[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ExperienceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Experience::class);
    }

    public function save(Experience $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Experience $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find experiences by search criteria
     */
    public function findBySearchCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('e');
        
        if (!empty($criteria['city'])) {
            $qb->andWhere('LOWER(e.city) LIKE LOWER(:city)')
               ->setParameter('city', '%' . $criteria['city'] . '%');
        }
        
        if (!empty($criteria['country'])) {
            $qb->andWhere('LOWER(e.country) LIKE LOWER(:country)')
               ->setParameter('country', '%' . $criteria['country'] . '%');
        }
        
        if (!empty($criteria['min_price'])) {
            $qb->andWhere('e.price >= :min_price')
               ->setParameter('min_price', $criteria['min_price']);
        }
        
        if (!empty($criteria['max_price'])) {
            $qb->andWhere('e.price <= :max_price')
               ->setParameter('max_price', $criteria['max_price']);
        }
        
        if (!empty($criteria['max_duration'])) {
            $qb->andWhere('e.durationMinutes <= :max_duration')
               ->setParameter('max_duration', $criteria['max_duration']);
        }
        
        // Order by price (default ascending)
        $direction = !empty($criteria['sort_direction']) && $criteria['sort_direction'] === 'desc' ? 'DESC' : 'ASC';
        $qb->orderBy('e.price', $direction);
        
        return $qb->getQuery()->getResult();
    }
}