# Landing Page CMS System

## Overview

This system implements a complete CMS (Content Management System) for creating and managing dynamic landing pages for real estate agents (corretores). The system follows a clear permission structure:

- **ADMIN**: Full control - can create, edit, and customize all landing pages
- **CORRETOR**: View only - can view their landing page and copy the link for sharing
- **PUBLIC**: Can access published landing pages via `/lp/[slug]`

## Key Features

### 🎨 Dynamic Block System

Landing pages are built using flexible, reorderable blocks. Available block types:

1. **Hero** - Banner with title, subtitle, text, image, and WhatsApp CTA
2. **História/Carrossel** - Company story with image carousel
3. **Galeria** - Photo gallery with zoom functionality
4. **CTA** - Call-to-action section with custom background
5. **Imóveis** - Property showcase (automatically shows corretor's properties)
6. **Vídeo** - YouTube video embed
7. **Texto** - Simple text block
8. **Contato** - Contact form with lead capture

### 🔒 Security & Permissions

- Middleware protects admin routes (`/admin/landings/*`)
- Server actions validate admin role for all write operations
- Corretores receive 403 Forbidden if they attempt to edit
- Public landing pages are accessible without authentication

### 📱 Routes

#### Admin Routes (Admin Only)
- `/admin/landings` - List all corretor landings
- `/admin/landings/[corretorId]` - Edit landing page with block editor

#### Corretor Routes (Corretor Only)
- `/corretor/minha-landing` - View landing page (read-only) with copy link button

#### Public Routes (No Auth Required)
- `/lp/[slug]` - Public landing page with dynamic content

## Database Schema

### CorretorProfile
```prisma
model CorretorProfile {
  landingAtiva Boolean @default(true)
  landingBlocos LandingBloco[]
  // ... other fields
}
```

### LandingBloco
```prisma
model LandingBloco {
  id         String   @id @default(cuid())
  corretorId String
  tipo       String   // Block type
  titulo     String?
  subtitulo  String?
  texto      String?
  imagens    String[]
  videoUrl   String?
  ordem      Int      // Display order
  ativo      Boolean  @default(true)
  config     Json?    // Additional config
  corretor   CorretorProfile @relation(...)
}
```

### Lead
```prisma
model Lead {
  imovelId   String?  // Now optional
  email      String?  // Now optional
  origem     String?  @default("site")
  // ... other fields
}
```

## Components

### Admin Components

- **LandingEditor** - Main editor interface with block management
- **BlocoForm** - Form for creating/editing blocks
- **BlocoItem** - Display block in editor with controls (move up/down, edit, delete, toggle)

### Public Components (Block Renderers)

- **HeroBloco** - Hero banner with CTA
- **HistoriaBloco** - Story with carousel
- **GaleriaBloco** - Photo gallery with modal
- **CTABloco** - Call-to-action section
- **ImoveisBloco** - Property showcase
- **VideoBloco** - YouTube video embed
- **TextoBloco** - Text content
- **ContatoBloco** - Contact form with lead capture

## Server Actions

### Admin Actions
- `getAllLandings()` - List all corretor landings
- `getLandingByCorretor(corretorId)` - Get landing with blocks
- `createLandingBloco(data)` - Create new block
- `updateLandingBloco(blocoId, data)` - Update block
- `deleteLandingBloco(blocoId)` - Delete block
- `reorderLandingBlocos(corretorId, blocoIds)` - Reorder blocks
- `toggleLandingAtiva(corretorId, ativa)` - Activate/deactivate landing

### Public Actions
- `getPublicLanding(slug)` - Get public landing with active blocks
- `createLeadFromLanding(data)` - Create lead from landing form

## SEO Features

Each landing page automatically generates:
- Dynamic `<title>` based on corretor name
- Meta `description` from hero block content
- OpenGraph tags with hero image
- Proper metadata for social sharing

## WhatsApp Integration

- All CTA buttons link to WhatsApp with formatted number
- Floating WhatsApp button on all landing pages
- Lead capture includes phone/WhatsApp field
- Leads marked with `origem: 'landing'` for tracking

## Usage Guide

### For Admins

1. Navigate to `/admin/landings`
2. Click "Editar" on any corretor
3. Add blocks using the sidebar
4. Fill in block content (title, subtitle, text, images, etc.)
5. Reorder blocks using up/down arrows
6. Toggle blocks active/inactive with eye icon
7. Delete blocks with trash icon
8. Click "Preview" to see live landing
9. Toggle "Ativar/Pausar Landing" to publish/unpublish

### For Corretores

1. Navigate to `/corretor/minha-landing`
2. View landing page status and blocks
3. Click "COPIAR LINK" to copy landing URL
4. Share the link on social media, WhatsApp, email, etc.
5. Contact admin for any changes needed

### For Public Users

1. Access landing page via shared link (e.g., `/lp/joao-silva`)
2. Browse dynamic content based on blocks
3. View corretor's properties
4. Contact via WhatsApp or contact form
5. Fill form to generate lead

## Testing

To test the system:

1. Run database migrations and seed:
```bash
npm run db:push
npm run db:seed
```

2. Start development server:
```bash
npm run dev
```

3. Test with provided credentials:
- Admin: `admin@example.com` / `123456`
- Corretor: `joao@example.com` / `123456`

4. Test landing pages:
- Admin: http://localhost:3000/admin/landings
- Corretor: http://localhost:3000/corretor/minha-landing
- Public: http://localhost:3000/lp/joao-silva

## Technical Details

### Technology Stack
- Next.js 16 (App Router)
- Prisma ORM
- PostgreSQL
- TypeScript
- TailwindCSS
- NextAuth for authentication

### Key Design Decisions

1. **Block-based architecture** - Allows unlimited customization without code changes
2. **Order field** - Enables drag-and-drop style reordering
3. **Active flag** - Allows hiding blocks without deletion
4. **JSON config** - Future-proof for block-specific settings
5. **Server actions** - Type-safe API with automatic validation
6. **Static typing** - Full TypeScript coverage for reliability

## Future Enhancements

Potential improvements for future versions:

- [ ] Drag-and-drop block reordering in UI
- [ ] Image upload integration (Cloudinary)
- [ ] Block templates/presets
- [ ] Landing page analytics
- [ ] A/B testing support
- [ ] Custom CSS per block
- [ ] Landing page duplication
- [ ] Export/import landing configurations
- [ ] Multi-language support
- [ ] Advanced SEO controls per landing
