import type React from 'react';
import type { IconProps } from './createIcon';
import { ArrowLeft } from './ArrowLeft';
import { ArrowLeftRight } from './ArrowLeftRight';
import { BarChart3 } from './BarChart3';
import { Bell } from './Bell';
import { BookOpen } from './BookOpen';
import { Bot } from './Bot';
import { Check } from './Check';
import { ChevronDown } from './ChevronDown';
import { ChevronLeft } from './ChevronLeft';
import { ChevronRight } from './ChevronRight';
import { ChevronUp } from './ChevronUp';
import { CircleAlert } from './CircleAlert';
import { CircleCheck } from './CircleCheck';
import { CircleHelp } from './CircleHelp';
import { CirclePlay } from './CirclePlay';
import { CircleX } from './CircleX';
import { ClipboardCheck } from './ClipboardCheck';
import { Clock } from './Clock';
import { CloudDownload } from './CloudDownload';
import { CloudUpload } from './CloudUpload';
import { Code } from './Code';
import { Copy } from './Copy';
import { Crown } from './Crown';
import { Database } from './Database';
import { Download } from './Download';
import { Eye } from './Eye';
import { EyeOff } from './EyeOff';
import { File } from './File';
import { FileArchive } from './FileArchive';
import { FileImage } from './FileImage';
import { FileSpreadsheet } from './FileSpreadsheet';
import { FileText } from './FileText';
import { Flag } from './Flag';
import { Flame } from './Flame';
import { Folder } from './Folder';
import { FolderOpen } from './FolderOpen';
import { Hash } from './Hash';
import { House } from './House';
import { Import } from './Import';
import { Inbox } from './Inbox';
import { Info } from './Info';
import { LayoutDashboard } from './LayoutDashboard';
import { LayoutGrid } from './LayoutGrid';
import { ListTodo } from './ListTodo';
import { Loader2 } from './Loader2';
import { Lock } from './Lock';
import { LogOut } from './LogOut';
import { Maximize2 } from './Maximize2';
import { MessageCircle } from './MessageCircle';
import { MessageSquare } from './MessageSquare';
import { Minimize2 } from './Minimize2';
import { PanelLeftClose } from './PanelLeftClose';
import { PanelLeftOpen } from './PanelLeftOpen';
import { Pause } from './Pause';
import { Pencil } from './Pencil';
import { Plus } from './Plus';
import { Presentation } from './Presentation';
import { RefreshCw } from './RefreshCw';
import { RotateCw } from './RotateCw';
import { Send } from './Send';
import { Settings } from './Settings';
import { Shield } from './Shield';
import { ShieldCheck } from './ShieldCheck';
import { SlidersHorizontal } from './SlidersHorizontal';
import { Square } from './Square';
import { Star } from './Star';
import { ThumbsDown } from './ThumbsDown';
import { ThumbsUp } from './ThumbsUp';
import { Trash2 } from './Trash2';
import { Trophy } from './Trophy';
import { Undo2 } from './Undo2';
import { Upload } from './Upload';
import { User } from './User';
import { UserPlus } from './UserPlus';
import { UserRoundCog } from './UserRoundCog';
import { Users } from './Users';
import { X } from './X';

export const ICON_NAMES = [
  'ArrowLeft',
  'ArrowLeftRight',
  'BarChart3',
  'Bell',
  'BookOpen',
  'Bot',
  'Check',
  'ChevronDown',
  'ChevronLeft',
  'ChevronRight',
  'ChevronUp',
  'CircleAlert',
  'CircleCheck',
  'CircleHelp',
  'CirclePlay',
  'CircleX',
  'ClipboardCheck',
  'Clock',
  'CloudDownload',
  'CloudUpload',
  'Code',
  'Copy',
  'Crown',
  'Database',
  'Download',
  'Eye',
  'EyeOff',
  'File',
  'FileArchive',
  'FileImage',
  'FileSpreadsheet',
  'FileText',
  'Flag',
  'Flame',
  'Folder',
  'FolderOpen',
  'Hash',
  'House',
  'Import',
  'Inbox',
  'Info',
  'LayoutDashboard',
  'LayoutGrid',
  'ListTodo',
  'Loader2',
  'Lock',
  'LogOut',
  'Maximize2',
  'MessageCircle',
  'MessageSquare',
  'Minimize2',
  'PanelLeftClose',
  'PanelLeftOpen',
  'Pause',
  'Pencil',
  'Plus',
  'Presentation',
  'RefreshCw',
  'RotateCw',
  'Send',
  'Settings',
  'Shield',
  'ShieldCheck',
  'SlidersHorizontal',
  'Square',
  'Star',
  'ThumbsDown',
  'ThumbsUp',
  'Trash2',
  'Trophy',
  'Undo2',
  'Upload',
  'User',
  'UserPlus',
  'UserRoundCog',
  'Users',
  'X',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/** 全量注册表：仅 showcase / 按名取图标时用；业务具名 import 勿依赖本文件，以免拖入全部图标 */
export const ICON_REGISTRY: Record<IconName, React.FC<IconProps>> = {
  ArrowLeft,
  ArrowLeftRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  CirclePlay,
  CircleX,
  ClipboardCheck,
  Clock,
  CloudDownload,
  CloudUpload,
  Code,
  Copy,
  Crown,
  Database,
  Download,
  Eye,
  EyeOff,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Flag,
  Flame,
  Folder,
  FolderOpen,
  Hash,
  House,
  Import,
  Inbox,
  Info,
  LayoutDashboard,
  LayoutGrid,
  ListTodo,
  Loader2,
  Lock,
  LogOut,
  Maximize2,
  MessageCircle,
  MessageSquare,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Pencil,
  Plus,
  Presentation,
  RefreshCw,
  RotateCw,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Square,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Trophy,
  Undo2,
  Upload,
  User,
  UserPlus,
  UserRoundCog,
  Users,
  X,
};
