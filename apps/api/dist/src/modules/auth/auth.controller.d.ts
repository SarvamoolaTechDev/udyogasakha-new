import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): unknown;
    login(dto: LoginDto): unknown;
    refresh(userId: string, dto: RefreshTokenDto): unknown;
    changePassword(userId: string, dto: ChangePasswordDto): unknown;
    logout(userId: string): unknown;
}
