import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListQueryDto } from '../common/list-query.dto';
import { Role } from '../common/role.enum';
import { User } from '../users/user.entity';
import { CreateStoreDto } from './dto/store.dto';
import { Rating } from './rating.entity';
import { Store } from './store.entity';

const SORT_COLUMNS: Record<string, string> = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'rating',
};

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private stores: Repository<Store>,
    @InjectRepository(Rating) private ratings: Repository<Rating>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async create(dto: CreateStoreDto) {
    if (await this.stores.findOne({ where: { email: dto.email } })) {
      throw new ConflictException('A store with this email already exists');
    }
    if (dto.ownerId) {
      const owner = await this.users.findOne({ where: { id: dto.ownerId } });
      if (!owner || owner.role !== Role.OWNER) {
        throw new BadRequestException('ownerId must belong to a user with the OWNER role');
      }
    }
    return this.stores.save(this.stores.create(dto));
  }

  countStores() {
    return this.stores.count();
  }

  countRatings() {
    return this.ratings.count();
  }

  // Store list with average rating; pass userId to also get that user's own rating
  async list(q: ListQueryDto, userId?: number) {
    const qb = this.stores
      .createQueryBuilder('s')
      .leftJoin('s.ratings', 'r')
      .select('s.id', 'id')
      .addSelect('s.name', 'name')
      .addSelect('s.email', 'email')
      .addSelect('s.address', 'address')
      .addSelect('ROUND(AVG(r.value), 1)', 'rating')
      .groupBy('s.id');

    if (userId) {
      qb.addSelect(
        (sub) =>
          sub
            .select('ur.value')
            .from(Rating, 'ur')
            .where('ur.storeId = s.id')
            .andWhere('ur.userId = :uid'),
        'userRating',
      ).setParameter('uid', userId);
    }

    if (q.name) qb.andWhere('s.name LIKE :name', { name: `%${q.name}%` });
    if (q.email) qb.andWhere('s.email LIKE :email', { email: `%${q.email}%` });
    if (q.address) qb.andWhere('s.address LIKE :address', { address: `%${q.address}%` });
    if (q.search) {
      qb.andWhere('(s.name LIKE :search OR s.address LIKE :search)', { search: `%${q.search}%` });
    }

    const col = SORT_COLUMNS[q.sortBy] || 's.name';
    qb.orderBy(col, q.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      email: r.email,
      address: r.address,
      rating: r.rating !== null ? Number(r.rating) : null,
      userRating: r.userRating !== undefined && r.userRating !== null ? Number(r.userRating) : null,
    }));
  }

  // Insert or update the user's rating for a store
  async rate(userId: number, storeId: number, value: number) {
    if (!(await this.stores.findOne({ where: { id: storeId } }))) {
      throw new NotFoundException('Store not found');
    }
    const existing = await this.ratings.findOne({ where: { userId, storeId } });
    if (existing) {
      existing.value = value;
      await this.ratings.save(existing);
    } else {
      await this.ratings.save(this.ratings.create({ userId, storeId, value }));
    }
    return { storeId, value };
  }

  // Dashboard data for a store owner; returns null if the owner has no store
  async ownerStats(ownerId: number) {
    const store = await this.stores.findOne({ where: { ownerId } });
    if (!store) return null;
    const ratings = await this.ratings.find({
      where: { storeId: store.id },
      relations: ['user'],
      order: { updatedAt: 'DESC' },
    });
    const average = ratings.length
      ? Math.round((ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length) * 10) / 10
      : null;
    return {
      store: { id: store.id, name: store.name, address: store.address },
      averageRating: average,
      totalRatings: ratings.length,
      raters: ratings.map((r) => ({
        userId: r.user.id,
        name: r.user.name,
        email: r.user.email,
        value: r.value,
        ratedAt: r.updatedAt,
      })),
    };
  }
}
