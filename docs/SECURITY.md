# Security Notes

## Environment Variables

The following environment variables should be configured for production:

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Application URL (e.g., https://yourdomain.com)

### Optional (but recommended)
- `GOOGLE_MAPS_API_KEY` - For map integration in property detail pages
- `CLOUDINARY_CLOUD_NAME` - For image uploads
- `CLOUDINARY_API_KEY` - For image uploads
- `CLOUDINARY_API_SECRET` - For image uploads

## Security Features Implemented

### Authentication & Authorization
- ✅ Password hashing with bcrypt
- ✅ JWT-based session management via NextAuth
- ✅ Role-based access control (ADMIN, CORRETOR)
- ✅ Protected routes with middleware

### Input Validation
- ✅ Zod validators for all forms
- ✅ Type-safe database queries with Prisma
- ✅ Server-side validation on all actions

### Rate Limiting
- ✅ Infrastructure for rate limiting ready
- ⚠️ Needs to be integrated into auth and lead actions
- Configuration in `src/lib/validators/index.ts`

### Database
- ✅ Prepared statements via Prisma (SQL injection prevention)
- ✅ Database indexes for performance
- ✅ Proper foreign key relationships

## Known Vulnerabilities

### Dependencies
- **next-auth** - 3 low severity vulnerabilities in cookie dependency
  - Impact: Out of bounds characters in cookie
  - Mitigation: Update to next-auth@4.24.7 or later when stable
  - Risk: Low (requires specific attack vector)

## Security Recommendations

### To Implement
1. **Rate Limiting on Actions**
   - Apply rate limiting to login, register, and lead creation
   - Use the infrastructure in `src/lib/utils/rate-limit.ts`

2. **CSRF Protection**
   - NextAuth provides built-in CSRF protection
   - Ensure all forms use proper Next.js form handling

3. **XSS Protection**
   - Sanitization functions exist in `src/lib/utils/index.ts`
   - Apply to user-generated content before display

4. **File Upload Security**
   - Implement file type validation
   - Implement file size limits
   - Use virus scanning for uploads

5. **Security Headers**
   - Add security headers in `next.config.ts`:
     - X-Frame-Options
     - X-Content-Type-Options
     - Referrer-Policy
     - Permissions-Policy

### Production Checklist
- [ ] Configure all environment variables
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Enable API rate limiting
- [ ] Set up monitoring and alerts
- [ ] Regular dependency updates
- [ ] Database backups
- [ ] Error logging (without exposing sensitive data)
- [ ] Security audit

## Contact
For security concerns, please contact the development team.
