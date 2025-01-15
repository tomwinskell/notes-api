import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';

const regExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(40)
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @Matches(regExp, {
    message: `Password must contain minimum 8 and maximum 20 characters,
    at least one uppercase letter,
    one lowercase letter,
    one number,
    and one special character.`,
  })
  password: string;
}
