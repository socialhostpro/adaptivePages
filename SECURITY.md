# 🔒 Security Guidelines for AdaptivePages

## API Key Security

### ❌ NEVER DO THIS:
- Hardcode API keys directly in source code
- Commit API keys to version control
- Include API keys in build configurations that are committed to Git
- Share API keys in documentation files

### ✅ SECURE PRACTICES:

#### Local Development:
1. Store API keys in `.env.local` (this file is in .gitignore)
2. Use environment variable loading in your code:
   ```typescript
   const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
   ```

#### Production Deployment:
1. Use Google Cloud Build substitution variables:
   ```yaml
   --set-env-vars
   VITE_GEMINI_API_KEY=${_GEMINI_API_KEY}
   ```

2. Deploy with environment variable:
   ```powershell
   $env:GEMINI_API_KEY="your_actual_key"
   .\deploy-with-env.ps1
   ```

## Current Security Status: ✅ SECURE

### What We Fixed:
1. ✅ Removed hardcoded API keys from `geminiService.ts` files
2. ✅ Updated `cloudbuild.yaml` to use substitution variables
3. ✅ Created secure deployment script (`deploy-with-env.ps1`)
4. ✅ Cleaned up exposed API keys from documentation

### Environment Variables Setup:

For local development, create `.env.local`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

For production deployment:
```powershell
# Set environment variables in PowerShell
$env:GEMINI_API_KEY="your_actual_gemini_api_key"
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_ANON_KEY="your_actual_supabase_anon_key"

# Then deploy
.\deploy-with-env-fixed.ps1
```

## Security Checklist:

- [ ] API keys are only in `.env.local` (gitignored)
- [ ] No hardcoded secrets in source code
- [ ] Production deployment uses environment variables
- [ ] Documentation doesn't contain real API keys
- [ ] Build configurations use substitution variables

## If You Accidentally Expose an API Key:

1. **Immediately revoke the exposed key** in Google Cloud Console
2. **Generate a new API key**
3. **Update your environment variables**
4. **Remove the exposed key from Git history** if committed

## Additional Security Measures:

1. **API Key Restrictions**: In Google Cloud Console, restrict your API key to specific APIs and IP addresses/domains
2. **Regular Rotation**: Rotate API keys periodically
3. **Monitoring**: Set up billing alerts and usage monitoring
4. **Access Control**: Limit who has access to production environment variables
