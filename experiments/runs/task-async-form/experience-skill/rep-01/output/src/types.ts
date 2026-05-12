export type FieldKey = "username" | "email" | "message";

export type UnifiedApiError = {
  kind: "client_4xx" | "server_5xx" | "timeout" | "network";
  status?: number;
  message: string;
  fieldErrors?: Partial<Record<FieldKey, string>>;
  retryable: boolean;
};

export type SubmitPhase = "idle" | "submitting" | "success" | "error";

export type RemoteValidationStatus =
  | "pristine"
  | "pending"
  | "valid"
  | "invalid";

export type RemoteFieldState = {
  status: RemoteValidationStatus;
  message?: string;
};
