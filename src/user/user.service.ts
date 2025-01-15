import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // service to creat a new user using user dto for validation
  create(createUserDto: CreateUserDto) {
    const user: User = new User();
    user.email = createUserDto.email;
    user.password = createUserDto.password;
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email } });
  }

  // public update(id: number, _updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  public remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
