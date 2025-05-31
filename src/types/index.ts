export interface ManagedImage {
  id: string;
  name: string;
  src: string;
  heightCm: number;
  aspectRatio: number;
  verticalOffsetCm: number;
  horizontalOffsetCm: number;
  color: string;
  gender: 'male' | 'female';
}

export interface PersonFormData {
  name: string;
  heightCm: number;
  gender: 'male' | 'female';
  color: string;
  customImage?: File;
}

export interface PersonFormProps {
  initialData?: PersonFormData;
  onSubmit: (data: Omit<ManagedImage, 'id'>) => void;
  buttonText?: string;
}

export interface SidebarProps {
  images: ManagedImage[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<ManagedImage>) => void;
  onAdd: (personData: Omit<ManagedImage, 'id'>) => void;
  onRemove: (id: string) => void;
  editingId?: string | null;
  onSetEditingId?: (id: string | null) => void;
  majorStep: number;
  className?: string;
}

export interface ComparerControlsProps {
  onClearAll: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomChange?: (value: number) => void;
  zoomLevel?: number;
  className?: string;
}

export interface ImageComparerProps {
  images: ManagedImage[];
  zoomLevel?: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onImageUpdate?: (id: string, updates: Partial<ManagedImage>) => void;
  onZoomChange?: (newZoom: number) => void;
  onMajorStepChange?: (step: number) => void;
} 