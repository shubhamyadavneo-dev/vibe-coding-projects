# Security Issues Report - Node.js Messy App

## Critical Security Vulnerabilities

### 1. Hardcoded Secrets (CRITICAL)
**Location**: `server.js` lines 23-25, `config/config.js`
**Issue**: Sensitive credentials stored directly in source code
**Impact**: Full system compromise if code is exposed
**Examples**:
```javascript
const JWT_SECRET = 'my-super-secret-key-that-is-not-secret';
const DB_PASSWORD = 'root123';
const API_KEY = 'sk_live_1234567890abcdef';
```
**Fix**: Use environment variables with `.env` file

### 2. SQL Injection Vulnerabilities (CRITICAL)
**Location**: Multiple files, especially `userController.js`
**Issue**: Direct string concatenation in SQL queries
**Impact**: Database compromise, data theft, data destruction
**Examples**:
```javascript
// userController.js line 33
const query = `SELECT * FROM users WHERE id = ${userId}`;

// server.js line 76
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;

// server.js line 103 (login endpoint)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// userController.js line 51
const query = `INSERT INTO users VALUES ('${username}', '${email}', '${password}')`;
```
**Fix**: Use parameterized queries or ORM with prepared statements

### 3. Information Exposure (HIGH)
**Location**: `server.js` lines 120-126
**Issue**: `/config` endpoint exposes all secrets
**Impact**: Attacker can obtain JWT secret, API keys, database passwords
**Response**:
```json
{
  "secret": "my-super-secret-key-that-is-not-secret",
  "apiKey": "sk_live_1234567890abcdef",
  "dbPassword": "root123"
}
```
**Fix**: Remove debug endpoints or restrict to admin only

### 4. Authentication Bypass (HIGH)
**Location**: `middleware/auth.js` lines 9-23
**Issue**: Authentication middleware calls `next()` even when JWT verification fails
**Impact**: Unauthorized access to protected routes
**Code**:
```javascript
try {
  const decoded = jwt.verify(token, config.jwtSecret);
  req.user = decoded;
  next();
} catch (error) {
  next(); // Should return 401, but calls next() instead
}
```
**Fix**: Return proper 401/403 responses on authentication failure

### 5. Weak CORS Configuration (MEDIUM)
**Location**: `config/config.js` lines 20-24
**Issue**: CORS allows all origins, methods, and headers
**Impact**: Cross-site request forgery (CSRF) risks
**Configuration**:
```javascript
cors: {
  origin: '*',
  methods: '*',
  allowedHeaders: '*'
}
```
**Fix**: Restrict to specific origins and methods

### 6. Plain Text Password Handling (HIGH)
**Location**: `userController.js` lines 48-66
**Issue**: Passwords stored and returned in plain text
**Impact**: Password exposure if database is compromised
**Code**:
```javascript
// Password stored without hashing
const query = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;

// Password returned in response
res.json({
  id: results.insertId,
  username,
  email,
  password  // <-- Exposed!
});
```
**Fix**: Use bcrypt or Argon2 for password hashing

### 7. No Input Validation/Sanitization (MEDIUM)
**Location**: All controller files
**Issue**: No validation of user input before processing
**Impact**: Injection attacks, data corruption, business logic bypass
**Fix**: Implement input validation middleware (Joi, express-validator)

### 8. Deprecated/Insecure Dependencies (MEDIUM)
**Location**: `package.json`
**Issue**: Outdated packages with known vulnerabilities
**Examples**:
- Express 4.16.0 (current is 4.19+)
- Mongoose 4.13.0 (current is 8+)
- Body-parser 1.18.0 (deprecated in Express 4.16+)
**Fix**: Update dependencies to latest secure versions

### 9. No Rate Limiting (MEDIUM)
**Location**: Missing implementation
**Issue**: No protection against brute force attacks
**Impact**: Account enumeration, credential stuffing, DoS
**Fix**: Implement rate limiting middleware (express-rate-limit)

### 10. Debug Mode Enabled in Production (LOW)
**Location**: `config/config.js` line 18
**Issue**: `debug: true` in configuration
**Impact**: Potential information leakage through debug logs
**Fix**: Use environment-specific configuration

### 11. Global Configuration Exposure (MEDIUM)
**Location**: `server.js` lines 58-61
**Issue**: Secrets stored in `global.config`
**Impact**: Secrets accessible throughout application, potential leakage
**Code**:
```javascript
global.config = {
  secret: JWT_SECRET,
  apiKey: API_KEY
};
```
**Fix**: Use module-level configuration, not global

### 12. Memory Leak Endpoint (LOW)
**Location**: `routes/userRoutes.js` lines 40-46
**Issue**: `/memory-leak` creates large array
**Impact**: Denial of Service through resource exhaustion
**Code**:
```javascript
const bigArray = [];
for (let i = 0; i < 1000000; i++) {
  bigArray.push({ data: 'x'.repeat(1000) });
}
```
**Fix**: Remove debug/test endpoints from production

### 13. Insecure Default Authentication (MEDIUM)
**Location**: `routes/userRoutes.js` lines 56-74
**Issue**: Hardcoded admin credentials
**Impact**: Default credentials that can be easily guessed
**Code**:
```javascript
if (username === 'admin' && password === 'admin123') {
  res.json({ token: 'fake-jwt-token' });
}
```
**Fix**: Remove hardcoded credentials, use proper user database

## Security Assessment Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 3     | Immediate attention required |
| HIGH     | 3     | Fix within 24 hours |
| MEDIUM   | 6     | Fix within 1 week |
| LOW      | 2     | Fix within 1 month |

**Overall Risk Score**: 8.2/10 (High Risk)

## Immediate Actions Required

1. **Remove hardcoded secrets** - Move to environment variables TODAY
2. **Fix SQL injection** - Implement parameterized queries TODAY
3. **Disable `/config` endpoint** - Remove or secure immediately
4. **Fix authentication bypass** - Update middleware to properly reject unauthorized requests

## Long-term Security Improvements

1. Implement proper authentication/authorization framework
2. Add comprehensive input validation
3. Set up security headers (CSP, HSTS, etc.)
4. Implement logging and monitoring
5. Regular security dependency scanning
6. Security testing in CI/CD pipeline

## References
- OWASP Top 10 2021: A03:2021-Injection, A07:2021-Identification and Authentication Failures
- CWE-798: Use of Hard-coded Credentials
- CWE-89: SQL Injection