import { IsEmail, IsOptional, IsString, IsNumber, Matches } from 'class-validator';

const regExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
export class UpdateUserDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(regExp, {
    message: `Password must contain minimum 8 and maximum 20 characters,
    at least one uppercase letter,
    one lowercase letter,
    one number,
    and one special character.`,
  })
  password?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string | null;
}
