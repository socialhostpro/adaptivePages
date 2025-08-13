1. Layout & Structure Components
These handle the app’s skeleton and repetitive structure.

AppLayout – global wrapper with header, sidebar, and footer.

Header / Navbar – site-wide navigation bar.

Sidebar – collapsible menu for navigation.

Footer – global footer.

PageContainer – consistent page padding, titles, breadcrumbs.

Section – reusable section with optional title/description.

Grid / Flex – layout helpers for positioning content.

2. Form Components
Reusable building blocks for forms so you don’t rewrite HTML inputs every time.

TextInput – single-line text fields.

TextArea – multi-line text input.

Select / Dropdown – single/multi-select.

Checkbox – basic checkbox input.

RadioGroup – grouped radio buttons.

DatePicker / TimePicker – date & time selection.

FileUploader – drag & drop or click-to-upload.

SearchBar – search input with icon & debounce.

ToggleSwitch – for boolean states.

FormError / FormHelperText – for error messages & hints.

3. Display Components
These are for showing data in consistent, styled formats.

Card – container for grouped content.

List / ListItem – reusable for menus or content lists.

Table – with sorting, filtering, and pagination.

Badge – small status/label indicators.

Tag / Chip – clickable or removable tags.

Avatar – profile pictures with initials fallback.

ProgressBar / ProgressCircle – progress indicators.

Rating – stars or custom ratings.

4. Feedback & Status Components
User feedback without breaking flow.

Alert – warnings, errors, success messages.

Modal / Dialog – pop-up windows.

Toast / Snackbar – small floating notifications.

Spinner / Loader – loading indicators.

Skeleton – placeholder for content loading states.

EmptyState – when there’s no data to show.

5. Navigation Components
Navigation helpers for different contexts.

Tabs – tabbed navigation between content.

Breadcrumbs – hierarchical navigation.

Pagination – for lists/tables.

StepWizard – multi-step forms/processes.

AnchorLink – smooth scroll to sections.

6. Utility Components
Generic helpers for better UX.

Icon – centralized icon rendering (e.g., using Lucide or Material Icons).

Tooltip – hover/click info popups.

Collapse / Accordion – expandable sections.

CopyToClipboardButton – copy text with feedback.

ErrorBoundary – catches and displays component errors.

ThemeSwitcher – light/dark mode toggle.

AuthGuard – wraps components/pages that require authentication.

7. Data Fetching / State-Aware Components
These manage API and state-based displays.

DataLoader – handles loading/error/success UI.

InfiniteScroll – continuous data loading.

LiveStatus – real-time connection/online status indicator.

8. Specialized Business Components (custom for your app)
Things unique to your domain that may be reused across features.

UserCard – standardized user profile display.

ProductTile – reusable e-commerce product card.

LicenseBadge – your app’s licensing status display.

AIResponseBlock – styled container for AI-generated responses.

FilePreview – show images, PDFs, etc. in consistent style.

💡 Best Practices for Setting This Up:

Put them in /src/components/shared or /src/ui so they’re clearly reusable.

Use TypeScript so props are strictly typed and self-documenting.

Keep pure UI components separate from stateful components — pass data in via props.

Make them theme-aware with your styling system (Tailwind, MUI, etc.).