import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ConvexService } from '../convex/convex.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key', // Use environment variable in production
      signOptions: { expiresIn: '24h' }, // Token expires in 24 hours
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ConvexService],
  exports: [AuthService],
})
export class AuthModule {}
