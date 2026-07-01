import type { LucideIcon, LucideProps } from 'lucide-react';
import './icons.global.css';
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowLeftRight as ArrowLeftRightIcon,
  BarChart3 as BarChart3Icon,
  BookOpen as BookOpenIcon,
  Bot as BotIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  CircleAlert as CircleAlertIcon,
  CircleCheck as CircleCheckIcon,
  CircleHelp as CircleHelpIcon,
  CirclePlay as CirclePlayIcon,
  CircleX as CircleXIcon,
  ClipboardCheck as ClipboardCheckIcon,
  Clock as ClockIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Code as CodeIcon,
  Copy as CopyIcon,
  Crown as CrownIcon,
  Database as DatabaseIcon,
  Download as DownloadIcon,
  Eye as EyeIcon,
  FileArchive as FileArchiveIcon,
  File as FileIcon,
  FileImage as FileImageIcon,
  FileSpreadsheet as FileSpreadsheetIcon,
  FileText as FileTextIcon,
  Flag as FlagIcon,
  Flame as FlameIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Hash as HashIcon,
  House as HouseIcon,
  Import as ImportIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
  LayoutDashboard as LayoutDashboardIcon,
  LayoutGrid as LayoutGridIcon,
  Loader2 as Loader2Icon,
  Lock as LockIcon,
  LogOut as LogOutIcon,
  MessageCircle as MessageCircleIcon,
  MessageSquare as MessageSquareIcon,
  PanelLeftClose as PanelLeftCloseIcon,
  PanelLeftOpen as PanelLeftOpenIcon,
  Pause as PauseIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  Presentation as PresentationIcon,
  RefreshCw as RefreshCwIcon,
  RotateCw as RotateCwIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  ShieldCheck as ShieldCheckIcon,
  Shield as ShieldIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  Square as SquareIcon,
  Star as StarIcon,
  ThumbsDown as ThumbsDownIcon,
  ThumbsUp as ThumbsUpIcon,
  Trash2 as Trash2Icon,
  Trophy as TrophyIcon,
  Undo2 as Undo2Icon,
  Upload as UploadIcon,
  User as UserIcon,
  UserPlus as UserPlusIcon,
  UserRoundCog as UserRoundCogIcon,
  Users as UsersIcon,
  X as XIcon,
} from 'lucide-react';
import React from 'react';

export type IconProps = LucideProps & {
  spin?: boolean;
  rotate?: number;
};

const createIcon = (Icon: LucideIcon, options?: { filled?: boolean }) => {
  const WrappedIcon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ spin, rotate, className, style, strokeWidth, fill, color, ...props }, ref) => (
      <Icon
        ref={ref}
        size="1em"
        className={['marsun-icon', className, spin ? 'animate-spin' : ''].filter(Boolean).join(' ') || undefined}
        style={{
          display: 'inline-block',
          verticalAlign: '-0.125em',
          ...(color ? {} : { color: 'inherit' }),
          ...(rotate ? { transform: `rotate(${rotate}deg)` } : null),
          ...style,
        }}
        color={color ?? 'currentColor'}
        strokeWidth={strokeWidth ?? (options?.filled ? 0 : 2)}
        fill={fill ?? (options?.filled ? 'currentColor' : 'none')}
        aria-hidden={props['aria-label'] ? undefined : true}
        {...props}
      />
    ),
  );

  WrappedIcon.displayName = Icon.displayName ?? Icon.name;
  return WrappedIcon;
};

export const ArrowLeft = createIcon(ArrowLeftIcon);
export const ArrowLeftRight = createIcon(ArrowLeftRightIcon);
export const BarChart3 = createIcon(BarChart3Icon);
export const BookOpen = createIcon(BookOpenIcon);
export const Bot = createIcon(BotIcon);
export const Check = createIcon(CheckIcon);
export const ChevronDown = createIcon(ChevronDownIcon);
export const ChevronLeft = createIcon(ChevronLeftIcon);
export const ChevronRight = createIcon(ChevronRightIcon);
export const ChevronUp = createIcon(ChevronUpIcon);
export const CircleAlert = createIcon(CircleAlertIcon);
export const CircleCheck = createIcon(CircleCheckIcon);
export const CircleHelp = createIcon(CircleHelpIcon);
export const CirclePlay = createIcon(CirclePlayIcon);
export const CircleX = createIcon(CircleXIcon);
export const ClipboardCheck = createIcon(ClipboardCheckIcon);
export const Clock = createIcon(ClockIcon);
export const CloudDownload = createIcon(CloudDownloadIcon);
export const CloudUpload = createIcon(CloudUploadIcon);
export const Code = createIcon(CodeIcon);
export const Copy = createIcon(CopyIcon);
export const Crown = createIcon(CrownIcon, { filled: true });
export const Database = createIcon(DatabaseIcon);
export const Download = createIcon(DownloadIcon);
export const Eye = createIcon(EyeIcon);
export const File = createIcon(FileIcon);
export const FileArchive = createIcon(FileArchiveIcon);
export const FileImage = createIcon(FileImageIcon);
export const FileSpreadsheet = createIcon(FileSpreadsheetIcon);
export const FileText = createIcon(FileTextIcon);
export const Flag = createIcon(FlagIcon);
export const Flame = createIcon(FlameIcon);
export const Folder = createIcon(FolderIcon);
export const FolderOpen = createIcon(FolderOpenIcon);
export const Hash = createIcon(HashIcon);
export const House = createIcon(HouseIcon);
export const Import = createIcon(ImportIcon);
export const Inbox = createIcon(InboxIcon);
export const Info = createIcon(InfoIcon);
export const LayoutDashboard = createIcon(LayoutDashboardIcon);
export const LayoutGrid = createIcon(LayoutGridIcon);
export const Loader2 = createIcon(Loader2Icon);
export const Lock = createIcon(LockIcon);
export const LogOut = createIcon(LogOutIcon);
export const MessageCircle = createIcon(MessageCircleIcon);
export const MessageSquare = createIcon(MessageSquareIcon);
export const PanelLeftClose = createIcon(PanelLeftCloseIcon);
export const PanelLeftOpen = createIcon(PanelLeftOpenIcon);
export const Pause = createIcon(PauseIcon, { filled: true });
export const Pencil = createIcon(PencilIcon);
export const Plus = createIcon(PlusIcon);
export const Presentation = createIcon(PresentationIcon);
export const RefreshCw = createIcon(RefreshCwIcon);
export const RotateCw = createIcon(RotateCwIcon);
export const Send = createIcon(SendIcon);
export const Settings = createIcon(SettingsIcon);
export const Shield = createIcon(ShieldIcon);
export const ShieldCheck = createIcon(ShieldCheckIcon);
export const SlidersHorizontal = createIcon(SlidersHorizontalIcon);
export const Square = createIcon(SquareIcon, { filled: true });
export const Star = createIcon(StarIcon, { filled: true });
export const ThumbsDown = createIcon(ThumbsDownIcon);
export const ThumbsUp = createIcon(ThumbsUpIcon);
export const Trash2 = createIcon(Trash2Icon);
export const Trophy = createIcon(TrophyIcon);
export const Undo2 = createIcon(Undo2Icon);
export const Upload = createIcon(UploadIcon);
export const User = createIcon(UserIcon);
export const UserPlus = createIcon(UserPlusIcon);
export const UserRoundCog = createIcon(UserRoundCogIcon);
export const Users = createIcon(UsersIcon);
export const X = createIcon(XIcon);

export { createIcon };

export const ICON_NAMES = [
  'ArrowLeft', 'ArrowLeftRight', 'BarChart3', 'BookOpen', 'Bot', 'Check',
  'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'CircleAlert',
  'CircleCheck', 'CircleHelp', 'CirclePlay', 'CircleX', 'ClipboardCheck', 'Clock',
  'CloudDownload', 'CloudUpload', 'Code', 'Copy', 'Crown', 'Database', 'Download',
  'Eye', 'File', 'FileArchive', 'FileImage', 'FileSpreadsheet', 'FileText', 'Flag',
  'Flame', 'Folder', 'FolderOpen', 'Hash', 'House', 'Import', 'Inbox', 'Info',
  'LayoutDashboard', 'LayoutGrid', 'Loader2', 'Lock', 'LogOut', 'MessageCircle',
  'MessageSquare', 'PanelLeftClose', 'PanelLeftOpen', 'Pause', 'Pencil', 'Plus',
  'Presentation', 'RefreshCw', 'RotateCw', 'Send', 'Settings', 'Shield',
  'ShieldCheck', 'SlidersHorizontal', 'Square', 'Star', 'ThumbsDown', 'ThumbsUp',
  'Trash2', 'Trophy', 'Undo2', 'Upload', 'User', 'UserPlus', 'UserRoundCog', 'Users', 'X',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const ICON_REGISTRY: Record<IconName, React.FC<IconProps>> = {
  ArrowLeft, ArrowLeftRight, BarChart3, BookOpen, Bot, Check,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleAlert,
  CircleCheck, CircleHelp, CirclePlay, CircleX, ClipboardCheck, Clock,
  CloudDownload, CloudUpload, Code, Copy, Crown, Database, Download,
  Eye, File, FileArchive, FileImage, FileSpreadsheet, FileText, Flag,
  Flame, Folder, FolderOpen, Hash, House, Import, Inbox, Info,
  LayoutDashboard, LayoutGrid, Loader2, Lock, LogOut, MessageCircle,
  MessageSquare, PanelLeftClose, PanelLeftOpen, Pause, Pencil, Plus,
  Presentation, RefreshCw, RotateCw, Send, Settings, Shield,
  ShieldCheck, SlidersHorizontal, Square, Star, ThumbsDown, ThumbsUp,
  Trash2, Trophy, Undo2, Upload, User, UserPlus, UserRoundCog, Users, X,
};
