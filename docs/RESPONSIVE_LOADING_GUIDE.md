# Responsiveness & Global Loading System - Usage Guide

## 📋 Overview

This document describes the new responsive and loading systems implemented in the application.

## 🔄 Loading System (3 Layers)

### 1. Global Loading

Full-page loading for navigation and major transitions.

```tsx
import { useLoading } from '@/context/LoadingContext'

function MyComponent() {
  const { startLoading, stopLoading } = useLoading()
  
  const handleNavigate = async () => {
    startLoading()
    // Navigate or fetch data
    router.push('/new-page')
  }
}
```

**GlobalLoading Component:**
```tsx
// In layout.tsx (already implemented)
<GlobalLoading 
  variant="spinner" // 'spinner' | 'dots' | 'pulse' | 'progress'
  text="Carregando..."
  showText={true}
  progress={50} // For progress variant
  steps={['Step 1', 'Step 2', 'Step 3']} // Optional steps
  currentStep={1} // Current step index
/>
```

### 2. Section Loading

Loading for modals, drawers, and specific sections.

```tsx
import { useSectionLoading } from '@/hooks/useSectionLoading'
import { SectionLoading } from '@/components/loading'

function MyModal() {
  const { isLoading, start, stop } = useSectionLoading('my-modal')
  
  const handleSave = async () => {
    start()
    try {
      await saveData()
    } finally {
      stop()
    }
  }
  
  return (
    <SectionLoading 
      isLoading={isLoading} 
      sectionId="my-modal"
      variant="overlay" // 'overlay' | 'skeleton' | 'spinner'
      message="Salvando..."
    >
      <div>Modal Content</div>
    </SectionLoading>
  )
}
```

### 3. Field Loading

Loading for buttons and individual fields.

```tsx
import { useFieldLoading } from '@/hooks/useSectionLoading'

function MyForm() {
  const { isLoading, start, stop } = useFieldLoading('submit-btn')
  
  return (
    <Button 
      isLoading={isLoading}
      onClick={async () => {
        start()
        try {
          await submit()
        } finally {
          stop()
        }
      }}
    >
      Submit
    </Button>
  )
}
```

## 📱 Responsive System

### Breakpoints

```typescript
xs: 0px      // Mobile
sm: 640px    // Tablet small
md: 768px    // Tablet
lg: 1024px   // Desktop
xl: 1280px   // Desktop large
2xl: 1536px  // Desktop XL
```

### Hooks

#### useBreakpoint
```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint'

function MyComponent() {
  const breakpoint = useBreakpoint() // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  
  return (
    <div>
      Current breakpoint: {breakpoint}
    </div>
  )
}
```

#### useIsMobile / useIsTablet / useIsDesktop
```tsx
import { useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/useBreakpoint'

function MyComponent() {
  const isMobile = useIsMobile() // < 768px
  const isTablet = useIsTablet() // 768px - 1024px
  const isDesktop = useIsDesktop() // >= 1024px
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  )
}
```

#### useWindowDimensions
```tsx
import { useWindowDimensions } from '@/hooks/useBreakpoint'

function MyComponent() {
  const { width, height } = useWindowDimensions()
  
  return <div>Window size: {width}x{height}</div>
}
```

### Responsive Components

#### ResponsiveGrid
```tsx
import { ResponsiveGrid, GridItem } from '@/components/ui/ResponsiveGrid'

function MyLayout() {
  return (
    <ResponsiveGrid 
      cols={{ xs: 1, md: 2, lg: 3 }} 
      gap="md"
      equalHeight
    >
      <GridItem colSpan={{ xs: 1, md: 2 }}>
        <Card>Featured Item</Card>
      </GridItem>
      <Card>Item 1</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
    </ResponsiveGrid>
  )
}
```

#### ResponsiveContainer
```tsx
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'

function MyLayout() {
  return (
    <ResponsiveContainer
      cols={{ xs: 1, md: 2, lg: 3, xl: 4 }}
      gap={{ xs: '1rem', lg: '2rem' }}
      layout="grid"
    >
      <Card />
      <Card />
      <Card />
    </ResponsiveContainer>
  )
}
```

#### Button with Responsive Props
```tsx
import { Button } from '@/components/ui/Button'

function MyForm() {
  return (
    <div className="flex gap-2">
      {/* Full width on mobile, auto on desktop */}
      <Button fullWidth className="md:w-auto">
        Submit
      </Button>
      
      {/* Responsive sizing */}
      <Button responsive size="md">
        Cancel
      </Button>
    </div>
  )
}
```

## 🎨 CSS Utilities

### Mobile-First Classes

```css
/* Container with responsive padding */
.container-responsive

/* Hide on mobile */
.hide-mobile

/* Show only on mobile */
.show-mobile

/* Hide scrollbar on mobile */
.hide-scrollbar

/* Responsive grid */
.grid-responsive

/* Responsive card */
.card-responsive

/* Responsive typography */
.text-responsive-h1
.text-responsive-h2
```

### Safe Areas (for PWA/Mobile)
```css
.safe-area-top
.safe-area-bottom
.safe-area-left
.safe-area-right
.safe-area-all
```

## 🎯 Kanban Responsiveness

The Kanban board is now fully responsive:

### Mobile (< 768px)
- Horizontal scroll with smaller columns
- Fullscreen modal
- Stacked filters
- Touch-friendly buttons

### Tablet (768px - 1024px)
- Medium-sized columns
- Reduced modal with simplified sidebar
- Compact filters

### Desktop (>= 1024px)
- Full-width columns
- Complete modal with sidebar
- All features visible

## 🔧 Examples

### Complete Form with Loading
```tsx
import { useSectionLoading } from '@/hooks/useSectionLoading'
import { SectionLoading } from '@/components/loading'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'
import { Button } from '@/components/ui/Button'

function ContactForm() {
  const { isLoading, start, stop } = useSectionLoading('contact-form')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    start()
    try {
      await submitForm()
    } finally {
      stop()
    }
  }
  
  return (
    <SectionLoading isLoading={isLoading} sectionId="contact-form" variant="overlay">
      <form onSubmit={handleSubmit}>
        <ResponsiveGrid cols={{ xs: 1, md: 2 }} gap="md">
          <input name="name" placeholder="Name" />
          <input name="email" placeholder="Email" />
          <textarea name="message" placeholder="Message" className="md:col-span-2" />
        </ResponsiveGrid>
        
        <div className="mt-4 flex gap-2">
          <Button type="submit" fullWidth className="md:w-auto">
            Submit
          </Button>
          <Button variant="secondary" fullWidth className="md:w-auto">
            Cancel
          </Button>
        </div>
      </form>
    </SectionLoading>
  )
}
```

### Responsive Dashboard
```tsx
import { useIsMobile } from '@/hooks/useBreakpoint'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'

function Dashboard() {
  const isMobile = useIsMobile()
  
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-responsive-h1 mb-4">Dashboard</h1>
      
      <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 4 }} gap="md">
        <MetricCard title="Total Sales" value="$10,000" />
        <MetricCard title="New Leads" value="25" />
        <MetricCard title="Active Users" value="150" />
        <MetricCard title="Conversion" value="12%" />
      </ResponsiveGrid>
      
      {!isMobile && (
        <div className="mt-6">
          <DetailedCharts />
        </div>
      )}
    </div>
  )
}
```

## 📚 Best Practices

1. **Mobile-First**: Always design for mobile first, then enhance for larger screens
2. **Touch Targets**: Ensure buttons are at least 44px on mobile (automatic with CSS)
3. **Loading Feedback**: Always provide loading feedback for async operations
4. **Section vs Global**: Use section loading for component actions, global for navigation
5. **Responsive Images**: Use lazy loading and responsive images
6. **Test on Real Devices**: Always test on actual mobile devices
7. **Safe Areas**: Use safe area classes for PWA installations

## 🚀 Performance Tips

1. Use `SectionLoading` with `skeleton` variant for better perceived performance
2. Lazy load images in mobile views
3. Reduce animations on mobile for better performance
4. Use `useBreakpoint` sparingly (causes re-renders on resize)
5. Prefer CSS media queries over JS breakpoint detection when possible

## 🐛 Common Issues

### Issue: Loading not appearing
**Solution**: Ensure `LoadingProvider` is wrapped around your app (already in layout.tsx)

### Issue: Responsive not working
**Solution**: Check that you're using the correct breakpoint values and that the window is properly sized

### Issue: Modal not fullscreen on mobile
**Solution**: Check that the modal container has the proper responsive classes

### Issue: Button sizes not responsive
**Solution**: Use the `responsive` prop or `fullWidth` prop on buttons
