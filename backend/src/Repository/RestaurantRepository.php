<?php

namespace App\Repository;

use App\Entity\Restaurant;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Restaurant>
 *
 * @method Restaurant|null find($id, $lockMode = null, $lockVersion = null)
 * @method Restaurant|null findOneBy(array $criteria, array $orderBy = null)
 * @method Restaurant[]    findAll()
 * @method Restaurant[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class RestaurantRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Restaurant::class);
    }

    public function save(Restaurant $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Restaurant $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find restaurants by city
     */
    public function findByCity(string $city)
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.city = :city')
            ->andWhere('r.isActive = :active')
            ->setParameter('city', $city)
            ->setParameter('active', true)
            ->orderBy('r.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find restaurants by cuisine type
     */
    public function findByCuisine(string $cuisine)
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.cuisine = :cuisine')
            ->andWhere('r.isActive = :active')
            ->setParameter('cuisine', $cuisine)
            ->setParameter('active', true)
            ->orderBy('r.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}