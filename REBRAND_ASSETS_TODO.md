# BKP Rebrand - Asset Migration Required

## ⚠️ Action Required: Rename Image Assets

The codebase has been fully rebranded from BNKY → BKP. However, the following image assets need to be renamed manually:

### Token Images
```bash
# Rename in /public/assets/tokens/
bnky.png → bkp.png
```

### Landing Page Visuals
```bash
# Rename in /public/assets/landing/
visual-bnky-coin.png → visual-bkp-coin.png
visual-bnky-3d-coin.png → visual-bkp-3d-coin.png
```

### Alternative: Create Symlinks (Temporary)
If you want to test before renaming originals:
```bash
cd public/assets/tokens/
cp bnky.png bkp.png

cd public/assets/landing/
cp visual-bnky-coin.png visual-bkp-coin.png
cp visual-bnky-3d-coin.png visual-bkp-3d-coin.png
```

## Environment Variables
Update your `.env.local` file:
```bash
# Old
NEXT_PUBLIC_BNKY_TOKEN_ADDRESS=C1MAQ3hbSVR6d5isBRRcBAJKnPrbVwfajDhiNLhJNrff

# New
NEXT_PUBLIC_BKP_TOKEN_ADDRESS=C1MAQ3hbSVR6d5isBRRcBAJKnPrbVwfajDhiNLhJNrff
```

## Completed Changes ✅

### Constants & Config
- ✅ `BNKY_TOKEN` → `BKP_TOKEN` in `src/config/tokens.ts`
- ✅ `BNKY_TOKEN_ADDRESS` → `BKP_TOKEN_ADDRESS`
- ✅ Updated all imports across the codebase

### Copy & Content
- ✅ All `$BNKY` → `$BKP` in user-facing text
- ✅ All `BNKY` → `BKP` in standalone references
- ✅ All `bnky` → `bkp` in IDs and lowercase paths
- ✅ Hero section copy
- ✅ ValuePropSection chapters
- ✅ TokenSpotlight callouts
- ✅ Security vault copy
- ✅ App mockup section
- ✅ Metadata (root layout, home page)
- ✅ Structured data (SEO)
- ✅ Transaction confirmation messages
- ✅ Settings descriptions

### Code References
- ✅ SwapForm.tsx - token constants and utility notice
- ✅ TokenListProvider.tsx - all token list references
- ✅ TokenSpotlight.tsx - buy link and token address
- ✅ TokenImage.tsx - image path mapping
- ✅ tokenImageOptimization.ts - critical tokens list
- ✅ smartTokenCache.ts - popular queries
- ✅ jupiter.ts - token address check
- ✅ partners.ts - token partner config
- ✅ fallbackTokens.json - fallback token list

## Build Status
- ✅ TypeScript compilation: PASS
- ✅ ESLint: PASS
- ✅ No errors detected

## Next Steps
1. Rename/copy the image assets listed above
2. Update your `.env.local` file
3. Restart the dev server
4. Test the swap interface and landing pages
5. Verify token images load correctly
