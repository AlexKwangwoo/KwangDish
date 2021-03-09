import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';
//AllowedRoles 마우스 올리면 뭐가 될수있는지 나온다!
//Any는 유저가 로그인만 되어있으면 된다는뜻!!
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
