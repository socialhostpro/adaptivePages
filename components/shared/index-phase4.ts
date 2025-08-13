/**
 * AdaptivePages Shared Components - Central Export Index
 * Complete component library with Phase 1-4 components
 */

// Phase 4: Data Display Components  
export {
  DataTable,
  type TableColumn,
  type TableAction,
  type DataTableProps
} from './DataTable';

export {
  Card,
  StatCard,
  ImageCard,
  type CardProps,
  type StatCardProps,
  type ImageCardProps
} from './Card';

export {
  ListView,
  ContactList,
  type ListItem,
  type ListViewProps,
  type ContactListProps
} from './ListView';

export {
  LineChart,
  BarChart,
  PieChart,
  Sparkline,
  type LineChartProps,
  type BarChartProps,
  type PieChartProps,
  type SparklineProps
} from './Charts';

export {
  Calendar,
  DatePicker,
  type DateRange,
  type CalendarProps,
  type DatePickerProps
} from './Calendar';

export {
  KanbanBoard,
  type KanbanCard,
  type KanbanColumn,
  type KanbanBoardProps
} from './KanbanBoard';

// Phase 3: Navigation Components (if available)
export {
  NavigationComponents
} from './NavigationComponents';

export {
  MobileNavigation
} from './MobileNavigation';

// Demo Components
export { Phase4Demo } from './Phase4Demo';
export { NavigationDemo } from './NavigationDemo';
