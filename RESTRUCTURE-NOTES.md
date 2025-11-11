# Project Restructuring Notes

## What Changed?

The Nava project has been restructured to separate concerns and simplify deployment.

### Before (Old Structure)
```
Nava/
├── nava-web/           # Web application
│   ├── app/
│   ├── lib/
│   └── ...
├── cli.py              # CLI files at root
├── browser.py
└── ...                 # Other Python files
```

### After (New Structure)
```
Nava/
├── app/                # Web app at root
├── lib/
├── nava-cli/           # CLI in subfolder
│   ├── cli.py
│   ├── browser.py
│   └── ...
└── ...                 # Web config files
```

## Why This Change?

1. **Simpler Deployment**: Vercel can now deploy directly from the repository root without needing to specify a subdirectory
2. **Cleaner Organization**: Web and CLI components are clearly separated
3. **Better Defaults**: The web interface (which is more commonly deployed) is now the default when cloning the repo
4. **Easier Maintenance**: Each component has its own dedicated space

## Key Benefits

### For Web Users
- Deploy to Vercel with zero configuration
- No need to specify root directory in Vercel settings
- Cleaner GitHub repository view (Next.js files at root)
- Faster setup - just `pnpm install` and `pnpm run dev`

### For CLI Users
- All Python files are now organized in `nava-cli/` folder
- Clear separation from web components
- Dedicated documentation in the CLI folder
- No confusion with web dependencies

## Migration Impact

### Developers
- Update any scripts that reference `nava-web/` to reference the root instead
- CLI users should `cd nava-cli` before running Python commands
- Documentation has been updated to reflect new structure

### CI/CD
- Vercel deployments now work from root (no root directory setting needed)
- Any automation scripts referencing old paths need updating

### Git History
- Files were moved using `git mv` to preserve history
- All Python CLI files moved to `nava-cli/`
- All Next.js files moved to repository root

## Documentation Updates

The following files have been updated to reflect the new structure:

- ✅ **README.md**: Completely restructured with dual interface documentation
- ✅ **QUICKSTART.md**: Updated with both web and CLI quick start guides
- ✅ **package.json**: Now at repository root
- ✅ **vercel.json**: Now at repository root
- ✅ All Next.js config files moved to root

## No Breaking Changes

Both interfaces continue to work exactly as before. Only the file locations have changed.

---

**Date**: November 11, 2025  
**Commit**: RESTRUCTURED PROJECT NAVA WEB FOLDER
