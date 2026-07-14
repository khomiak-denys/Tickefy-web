export interface ProblemDetails {
  status: number;
  title: string;
  detail: string | null;
  errors: {
    [key: string]: string[];
  } | null;
}
