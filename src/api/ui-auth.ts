interface LoginResponse {
  ok: boolean;
  message?: string;
}

interface BackendAuthResponse {
  metadata?: {
    auth?: "trusted" | "untrusted";
  };
}

export const loginWithPassword = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await fetch("/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  const body = (await response
    .json()
    .catch(() => ({ ok: false }))) as LoginResponse;

  if (!response.ok) {
    return {
      ok: false,
      message: body.message ?? "Login failed",
    };
  }

  return {
    ok: true,
  };
};

export const checkBackendTrusted = async (): Promise<boolean> => {
  const response = await fetch("/1.0", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    return false;
  }

  const body = (await response.json().catch(() => ({}))) as BackendAuthResponse;

  return body.metadata?.auth === "trusted";
};

export const logoutAuthCookie = async (): Promise<void> => {
  await fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => null);
};
