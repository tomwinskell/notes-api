import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

const saltRounds = 10;
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // service to create a new user, using user dto for validation, hash password with bcrypt
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // create an instance of a new user
      const user: User = new User();
      user.email = createUserDto.email;

      // use bcrypt to hash the password
      user.password = await bcrypt.hash(createUserDto.password, saltRounds);

      user.refreshToken = createUserDto.refreshToken;

      // save the user to the database
      return this.userRepository.save(user);
    } catch (error) {
      console.error('Error creating user: ', error);
      throw new Error('User creation failed');
    }
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email: email });
  }

  findOneById(inputId: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id: inputId });
  }

  async update(updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userRepository.findOneBy({
      id: updateUserDto.id,
    });

    if (!userToUpdate) {
      throw new Error('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    return this.userRepository.save({
      ...userToUpdate,
      ...updateUserDto,
    });
  }

  public remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
