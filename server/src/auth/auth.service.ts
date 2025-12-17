import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12;
  private readonly ACCESS_TOKEN_EXPIRATION = '15m';
  private readonly REFRESH_TOKEN_EXPIRATION = '7d';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { name, email, username, password } = registerDto;

    this.logger.log(`Attempting to register user: ${email}`);

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        this.logger.warn(`Registration failed: Email already registered - ${email}`);
        throw new ConflictException('Email is already registered');
      }
      this.logger.warn(`Registration failed: Username already taken - ${username}`);
      throw new ConflictException('Username is already taken');
    }

    // Validate password strength
    this.validatePasswordStrength(password);

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // Create new user
    const user = this.userRepository.create({
      name,
      email,
      username,
      passwordHash,
      avatar: null,
      isActive: true,
    });

    try {
      await this.userRepository.save(user);
      this.logger.log(`Successfully registered user: ${user.id} (${user.email})`);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      if (error instanceof Error && error.message.includes('Duplicate')) {
        throw new ConflictException('Email or username already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.username);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return this.buildAuthResponse(user, accessToken, refreshToken);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    this.logger.log(`Login attempt for email: ${email}`);

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      this.logger.warn(`Login failed: User not found for email ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for user ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      this.logger.warn(`Login failed: Account deactivated for user ${email}`);
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.username);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    this.logger.log(`Successful login for user: ${user.id} (${user.email})`);

    return this.buildAuthResponse(user, accessToken, refreshToken);
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
      });

      // Find user
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        {
          email: user.email,
          username: user.username,
        },
        {
          subject: user.id,
          secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
          expiresIn: this.ACCESS_TOKEN_EXPIRATION,
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`Logout attempt for user: ${userId}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user) {
      user.refreshToken = null;
      await this.userRepository.save(user);
      this.logger.log(`Successfully logged out user: ${userId}`);
    } else {
      this.logger.warn(`Logout failed: User not found for ID ${userId}`);
    }
  }

  private async generateTokens(userId: string, email: string, username: string) {
    const accessToken = this.jwtService.sign(
      {
        email,
        username,
      },
      {
        subject: userId,
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: this.ACCESS_TOKEN_EXPIRATION,
      },
    );

    const refreshToken = this.jwtService.sign(
      {},
      {
        subject: userId,
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
        expiresIn: this.REFRESH_TOKEN_EXPIRATION,
      },
    );

    return { accessToken, refreshToken };
  }

  private buildAuthResponse(
    user: User,
    accessToken: string,
    refreshToken: string,
  ): AuthResponse {
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    };
  }

  private validatePasswordStrength(password: string): void {
    // Password must be at least 8 characters
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Password should contain uppercase, lowercase, number, and special character
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (strength < 3) {
      throw new BadRequestException(
        'Password must contain at least 3 of the following: uppercase letters, lowercase letters, numbers, and special characters',
      );
    }
  }
}
