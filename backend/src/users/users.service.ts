import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ListQueryDto } from '../common/list-query.dto';
import { Role } from '../common/role.enum';
import { User } from './user.entity';

const SORT_COLUMNS: Record<string, string> = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  role: 'u.role',
};

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private config: ConfigService,
  ) {}

  // Creates the first admin from .env so someone can log in
  async onModuleInit() {
    const email = this.config.get<string>('ADMIN_EMAIL');
    if (!email || (await this.repo.findOne({ where: { email } }))) return;
    await this.create({
      name: this.config.get('ADMIN_NAME') || 'System Administrator Account',
      email,
      address: 'Head Office',
      password: this.config.get('ADMIN_PASSWORD'),
      role: Role.ADMIN,
    });
  }

  async create(data: { name: string; email: string; address: string; password: string; role: Role }) {
    if (await this.repo.findOne({ where: { email: data.email } })) {
      throw new ConflictException('Email is already registered');
    }
    const hash = await bcrypt.hash(data.password, 10);
    const saved = await this.repo.save(this.repo.create({ ...data, password: hash }));
    const { password, ...safe } = saved;
    return safe;
  }

  findByEmailWithPassword(email: string) {
    return this.repo.createQueryBuilder('u').addSelect('u.password').where('u.email = :email', { email }).getOne();
  }

  findByIdWithPassword(id: number) {
    return this.repo.createQueryBuilder('u').addSelect('u.password').where('u.id = :id', { id }).getOne();
  }

  async findById(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updatePassword(id: number, plain: string) {
    await this.repo.update(id, { password: await bcrypt.hash(plain, 10) });
  }

  count() {
    return this.repo.count();
  }

  list(q: ListQueryDto) {
    const qb = this.repo.createQueryBuilder('u');
    if (q.name) qb.andWhere('u.name LIKE :name', { name: `%${q.name}%` });
    if (q.email) qb.andWhere('u.email LIKE :email', { email: `%${q.email}%` });
    if (q.address) qb.andWhere('u.address LIKE :address', { address: `%${q.address}%` });
    if (q.role) qb.andWhere('u.role = :role', { role: q.role });
    const col = SORT_COLUMNS[q.sortBy] || 'u.name';
    qb.orderBy(col, q.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
    return qb.getMany();
  }
}
