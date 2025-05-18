# Development Notes

## TypeScript Testing Issues & Solutions (May 14, 2025)

### PostgreSQL Pool Mocking in Tests
**File**: `postgres-user.service.test.ts`
**Issue**: Type errors when mocking pg Pool's query method
**Solution**:
- Properly typed mock pool implementation:
```typescript
const mockPool = {
  query: jest.Mock<Promise<QueryResult<User>>>,
  end: jest.Mock
};
```
- This ensures type safety while maintaining the correct interface for pg Pool's query method

### Controller Dependency Injection
**File**: `auth.controller.test.ts`
**Issue**: Type mismatch between PostgresUserService and mocked UserService in AuthController constructor
**Learnings**:
- Identified tight coupling between controller and concrete implementation
- Suggested improvement: Controller should depend on interface rather than concrete implementation
- Better follows dependency injection principles and makes testing easier

### Database Migrations System
**Location**: `src/db/migrate.ts`
**Status**: Fully Implemented
**Features**:
- Migration scripts properly implemented
- Package.json contains necessary migration scripts
- Supports both up and down migrations

**Configuration**:
- Environment variables need to be documented
- Migration commands available through npm scripts

### Testing Best Practices Learned
1. When mocking complex interfaces like pg Pool:
   - Ensure mock types match the original interface exactly
   - Pay special attention to Promise return types
   - Use Jest's typing system effectively for mocks

2. For dependency injection:
   - Design classes to depend on interfaces rather than implementations
   - Makes testing more straightforward
   - Reduces coupling between components

3. Database interaction testing:
   - Properly type database query results
   - Consider using a test database for integration tests
   - Ensure migrations can be reversed for test cleanup

### Next Steps
1. Update README.md with environment variable documentation
2. Consider refactoring controllers to use interfaces
3. Document migration procedures
4. Consider adding integration test suite with test database

## Path Aliases and Module Resolution

The project uses TypeScript path aliases (defined in `tsconfig.json`) for cleaner imports:

```typescript
// Instead of relative imports like:
import { something } from '../../../config/something';

// We can use:
import { something } from '@config/something';
```

### Configuration by Tool

Different tools handle path aliases differently:

1. **TypeScript Compiler (`npm run build`)**
   - Uses `tsconfig.json` paths directly
   - No additional configuration needed
   - Automatically resolves aliases during compilation

2. **Jest Tests (`npm test`)**
   - Configured in `jest.config.ts`
   - Uses `ts-jest` and `pathsToModuleNameMapper` utility
   - Automatically converts TypeScript paths to Jest module mappings
   ```typescript
   moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
     prefix: '<rootDir>/src/',
   })
   ```

3. **Runtime Execution (`npm run dev`, `npm run migrate`)**
   - Requires `tsconfig-paths/register` for runtime resolution
   - Scripts must include `-r tsconfig-paths/register` flag
   ```json
   {
     "dev": "nodemon -r tsconfig-paths/register src/app.ts",
     "migrate": "ts-node -r tsconfig-paths/register src/db/migrate.ts"
   }
   ```

### Current Path Aliases

```json
{
  "@models/*": ["models/*"],
  "@utils/*": ["utils/*"],
  "@config/*": ["config/*"]
}
```

### Troubleshooting

If you encounter `MODULE_NOT_FOUND` errors:
1. For runtime scripts: Ensure `-r tsconfig-paths/register` is added to the command
2. For tests: Check `jest.config.ts` has correct path mappings
3. For build: Verify paths in `tsconfig.json` match your directory structure 