export interface ComponentExample {
  title: string;
  description: string;
  component: React.LazyExoticComponent<React.FC>;
  sourcePath: () => Promise<{ default: string }>;
  block?: boolean;
}

export interface ApiDocRow {
  prop: string;
  desc: string;
  type: string;
  defaultVal?: string;
  required?: boolean;
}

export interface ExampleGroup {
  title: string;
  description?: string;
  examples: ComponentExample[];
  apiDoc?: { componentName: string; rows: ApiDocRow[] }[];
}
